# backend/app/routes/interview_routes.py
import os
import re
import json
import random
from typing import List, Any, Optional, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas, utils
from ..routes.user_routes import get_current_user, get_db
from ..services.llm_service import generate_with_llm

# try to import prompts from interview_engine; fallback to inline prompts if module missing
try:
    from ..interview_engine.llm_prompts import (
        prompt_generate_questions,
        prompt_evaluate_answer,
        prompt_follow_up,
        prompt_summarize_resume,
    )
except Exception:
    def prompt_summarize_resume(resume_text: str) -> str:
        trimmed = (resume_text or "")[:1500]
        return f"""
You are an assistant that summarizes a candidate resume.

Return STRICT JSON only with:
{{ "core_skills": ["skill1","skill2"], "projects": [{{"name":"p","tech":["t"],"role":"r"}}] }}

Resume:
\"\"\"{trimmed}\"\"\"
"""

    def prompt_generate_questions(resume_text: str, max_questions: int = 8) -> str:
        trimmed = (resume_text or "")[:1200]
        return f"""
You are a senior technical interviewer.

Based ONLY on this resume fragment, produce up to {max_questions} targeted technical questions.
Return STRICT JSON: {{ "questions": ["q1","q2"] }}

Resume:
\"\"\"{trimmed}\"\"\"
"""

    def prompt_evaluate_answer(question: str, answer: str, resume_text: str = "") -> str:
        short_resume = (resume_text or "")[:1000]
        return f"""
You are a senior interviewer. Evaluate the candidate answer and return STRICT JSON only:

{{ "overall_score": 0, "technical": 0, "communication": 0, "depth": 0, "resume_match": 0,
  "strengths": [], "weaknesses": [], "tips": [] }}

Question: {question}
Answer: {answer}
Resume: {short_resume}
"""

    def prompt_follow_up(question: str, answer: str) -> str:
        return f"""
You are a senior interviewer. Produce exactly one deep follow-up question in JSON:
{{ "follow_up": "..." }}

Original question:
{question}

Candidate answer:
{answer}
"""

router = APIRouter(prefix="/interviews", tags=["interviews"])

# Config
LLM_FORCE_EVAL = os.getenv("LLM_FORCE_EVAL", "false").lower() in ("1", "true", "yes")
LLM_MODEL_ENV = os.getenv("LLM_MODEL")
SUMMARY_TRUNCATE = int(os.getenv("SUMMARY_TRUNCATE", "1500"))
LLM_TIMEOUT_SHORT = int(os.getenv("LLM_TIMEOUT_SHORT", "40"))
LLM_TIMEOUT_LONG = int(os.getenv("LLM_TIMEOUT_LONG", "90"))

# ============================================================
# Predefined CS fundamentals bank (30 each -> 120 total)
# ============================================================
# OOP Questions (30)
OOP_QS = [
    "What is encapsulation and why is it useful?",
    "Explain inheritance with an example and its pros/cons.",
    "What is polymorphism? Provide examples (compile-time and run-time).",
    "What are interfaces vs abstract classes and when to use each?",
    "Explain SOLID principles; give a short example for Single Responsibility.",
    "What is composition vs inheritance; when should you prefer composition?",
    "How does method overriding differ from method overloading?",
    "What are design patterns? Explain the Factory pattern.",
    "Explain the Observer pattern & a use case where it helps.",
    "How do you implement dependency injection and why?",
    "What is Liskov Substitution Principle with an example of violation?",
    "Discuss coupling and cohesion in OOP and why they matter.",
    "Explain encapsulation breaches (public fields) consequences.",
    "How do you design a plugin system with OOP principles?",
    "Explain the Adapter pattern and where it's useful.",
    "What is the Template Method pattern?",
    "How would you mock dependencies for OOP unit tests?",
    "Explain the Builder pattern and when you would use it.",
    "What is a mixin and how is it used in some languages?",
    "Explain the Visitor pattern and a scenario for it.",
    "How to avoid diamond problem in multiple inheritance?",
    "What is an immutable object and why prefer immutability sometimes?",
    "Explain when to use composition to expose behavior at runtime.",
    "What are value objects vs entities in domain modeling?",
    "How to design a versioned API client using OOP?",
    "How to model relationships (1-to-many, many-to-many) in OOP?",
    "Explain how you would implement undo/redo using OOP.",
    "What are the tradeoffs of deep inheritance hierarchies?",
    "How to serialize/deserialize OOP graphs safely?",
    "Explain interface segregation principle with an example."
]

# DBMS Questions (30)
DBMS_QS = [
    "Explain normalization and normal forms up to 3NF.",
    "What are indexes? How do they improve query performance?",
    "When does an index hurt performance?",
    "Explain transactions and ACID properties.",
    "What are isolation levels and phantom reads?",
    "What is a B-tree index vs hash index?",
    "Explain denormalization and when to use it.",
    "How to design schema for many-to-many relationships?",
    "Explain query execution plan and how to read it.",
    "What is a covering index?",
    "How does database sharding work and when to shard?",
    "Explain replication types (master-slave, multi-master).",
    "What are materialized views and when to use them?",
    "Explain optimistic vs pessimistic locking.",
    "How to handle schema migrations in production?",
    "What is eventual consistency vs strong consistency?",
    "Explain foreign keys and cascade actions.",
    "How to mitigate deadlocks and reason about them?",
    "What is an OLTP vs OLAP workload?",
    "How to design for high write throughput in RDBMS?",
    "Explain how to tune database connection pooling.",
    "What is a composite index and how is it used?",
    "Explain partitioning strategies (range, list, hash).",
    "How to model time-series data in a relational DB?",
    "Explain the CAP theorem and its implications.",
    "What are stored procedures and pros/cons?",
    "Explain indexing on text columns and full-text search basics.",
    "How to estimate cardinality for query planning?",
    "Explain cross-database joins and their drawbacks.",
    "How to design a hotspot-free primary key strategy?"
]

# OS Questions (30)
OS_QS = [
    "Explain processes vs threads and context switching.",
    "What is a race condition and how do you prevent it?",
    "Explain deadlock conditions and one prevention method.",
    "What is virtual memory and how paging works?",
    "Explain how a CPU scheduler decides which process runs.",
    "What is a mutex vs a semaphore?",
    "Explain how file systems organize data on disk.",
    "What are system calls and how do they work?",
    "Explain copy-on-write and where it's used.",
    "What is paging vs segmentation?",
    "How does a kernel handle interrupts?",
    "Explain I/O scheduling and why it's necessary.",
    "What is process synchronization and condition variables?",
    "Describe memory fragmentation and mitigation techniques.",
    "Explain swap space and when it is used.",
    "What is kernel preemption and why it matters?",
    "Explain how user-space and kernel-space communicate (e.g., ioctl).",
    "What is priority inversion and how to solve it?",
    "Explain how context switch cost impacts multi-threading design.",
    "What is a race-avoidant lock-free data structure?",
    "Describe copy-on-write fork() implementation details.",
    "Explain the bootstrap process (bootloader -> kernel).",
    "Describe how to profile CPU-bound code on a server.",
    "What is an interrupt vector table?",
    "Explain pipelining hazards in CPU microarchitecture (brief).",
    "How do page replacement algorithms like LRU work?",
    "Explain memory mapped files and benefits.",
    "What is address space layout randomization (ASLR)?",
    "Describe how systemd (or init) manages services at boot."
]

# Computer Networks Questions (30)
CN_QS = [
    "Explain the TCP three-way handshake and teardown.",
    "What is UDP and when would you use it?",
    "Explain congestion control in TCP (brief: AIMD).",
    "What is DNS and how does name resolution work?",
    "Explain HTTP request/response lifecycle and status codes.",
    "What is TLS and how does it secure connections?",
    "Explain subnetting and how to calculate subnets.",
    "What are sockets and how are they used in apps?",
    "Explain NAT and its types (SNAT, DNAT).",
    "What is ARP and how does it map IP to MAC?",
    "Explain the OSI model layers with examples.",
    "What is a CDN and how does it reduce latency?",
    "Explain load balancing strategies (round robin, least conn).",
    "What is HTTP/2 multiplexing and why it helps?",
    "Explain how TCP flow control works (windowing).",
    "What is BGP and why is it critical for the Internet?",
    "Explain TLS certificate chain and trust anchors.",
    "What is packet loss and how to detect it?",
    "Explain QoS basics and traffic prioritization.",
    "What is a VPN and how does it secure tunnels?",
    "Explain IPv6 addressing key differences vs IPv4.",
    "What is multicast vs broadcast vs unicast?",
    "Explain how to measure network latency and jitter.",
    "What is a handshake latency vs transfer latency?",
    "Explain layer 2 vs layer 3 switching differences.",
    "What is HTTP caching and cache-control headers?",
    "Explain how TLS session resumption works.",
    "What is a socket backlog and why tune it?",
    "Explain how TCP selective acknowledgements (SACK) work.",
    "What are SYN flood attacks and mitigation strategies?"
]

COMBINED_CS_BANK = OOP_QS + DBMS_QS + OS_QS + CN_QS


# -------------------------
# Helpers: robust JSON extraction from LLM responses
# -------------------------
def _try_parse_json_string(s: str) -> Optional[Any]:
    if not s:
        return None
    s = s.strip()

    # direct
    try:
        return json.loads(s)
    except Exception:
        pass

    # remove fences
    s2 = s.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(s2)
    except Exception:
        pass

    # regex: extract first {...} or [...]
    m = re.search(r'(\{(?:.|\n)*\}|\[(?:.|\n)*\])', s, re.DOTALL)
    if m:
        cand = m.group(1)
        try:
            return json.loads(cand)
        except Exception:
            pass

    return None


def _unwrap_llm_resp(llm_resp: dict) -> Optional[Any]:
    if not llm_resp or not isinstance(llm_resp, dict):
        return None

    parsed = llm_resp.get("json")
    raw = llm_resp.get("raw", "") or ""

    # 1) If parsed already looks like final (has expected keys), return
    if isinstance(parsed, dict):
        if any(k in parsed for k in ("core_skills", "projects", "questions", "follow_up")):
            return parsed

        msg = parsed.get("message") or parsed.get("result") or parsed.get("output")
        if isinstance(msg, dict):
            content = msg.get("content") or msg.get("text") or msg.get("response")
            if isinstance(content, str) and content.strip():
                inner = _try_parse_json_string(content)
                if inner is not None:
                    return inner

        if "response" in parsed and isinstance(parsed["response"], str):
            inner = _try_parse_json_string(parsed["response"])
            if inner is not None:
                return inner

        choices = parsed.get("choices")
        if isinstance(choices, list) and choices:
            first = choices[0]
            if isinstance(first, dict):
                if "message" in first and isinstance(first["message"], dict):
                    content = first["message"].get("content") or first["message"].get("text")
                    if content:
                        inner = _try_parse_json_string(content)
                        if inner is not None:
                            return inner
                if "text" in first and isinstance(first["text"], str):
                    inner = _try_parse_json_string(first["text"])
                    if inner is not None:
                        return inner

    # 2) If parsed is list/dict but not containing expected keys, still return it
    if isinstance(parsed, (list, dict)):
        return parsed

    # 3) Try parsing the raw text body
    if raw:
        inner = _try_parse_json_string(raw)
        if inner is not None:
            return inner

    return None


def _normalize_int_safe(x):
    try:
        return max(0, min(100, int(x)))
    except Exception:
        return 0


# -------------------------
# Routes
# -------------------------
@router.post("/start", response_model=schemas.StartInterviewResp)
def start_interview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    print(f"[start_interview] user={current_user.id} starting interview")
    if not current_user.resume_path:
        raise HTTPException(status_code=400, detail="Upload resume first")

    # Extract resume text and light parse
    try:
        text = utils.extract_text_from_pdf(current_user.resume_path) or ""
        parsed = utils.parse_resume_text(text)
        resume_keywords = parsed.get("keywords", [])[:80]
    except Exception as e:
        print("[start_interview] resume parse error:", e)
        text = ""
        parsed = {"keywords": []}
        resume_keywords = []

    # STEP 1: summarize resume (LLM)
    summary_data = {"core_skills": parsed.get("skills", []), "projects": []}
    try:
        print("[start_interview] summarizing resume with LLM...")
        sum_prompt = prompt_summarize_resume((text or "")[:SUMMARY_TRUNCATE])
        sum_resp = generate_with_llm(sum_prompt, model=LLM_MODEL_ENV, timeout=LLM_TIMEOUT_SHORT)
        print("[start_interview] summarize raw ok:", sum_resp.get("ok"), "error:", sum_resp.get("error"))
        unwrapped = _unwrap_llm_resp(sum_resp)
        if unwrapped and isinstance(unwrapped, dict):
            if "core_skills" in unwrapped or "projects" in unwrapped:
                summary_data = unwrapped
                print("[start_interview] resume summary parsed by LLM (unwrapped).")
            else:
                if "skills" in unwrapped and isinstance(unwrapped["skills"], list):
                    summary_data["core_skills"] = unwrapped["skills"]
                    print("[start_interview] resume summary mapped from unwrapped dict.")
                else:
                    print("[start_interview] resume summary unwrapped but missing expected keys; using fallback parsed data.")
        else:
            print("[start_interview] resume summary failed or not JSON; using parsed fallback.")
    except Exception as e:
        print("[start_interview] resume summarization exception:", e)
        summary_data = {"core_skills": parsed.get("skills", [])[:10], "projects": []}

    # STEP 2: generate targeted questions via LLM (short prompt)
    questions: List[str] = []
    try:
        print("[start_interview] generating questions with LLM...")
        gen_prompt = prompt_generate_questions(json.dumps(summary_data), max_questions=24)
        q_resp = generate_with_llm(gen_prompt, model=LLM_MODEL_ENV, timeout=LLM_TIMEOUT_SHORT)
        print("[start_interview] generate questions raw ok:", q_resp.get("ok"), "error:", q_resp.get("error"))
        q_unwrapped = _unwrap_llm_resp(q_resp)
        if q_unwrapped:
            if isinstance(q_unwrapped, dict) and "questions" in q_unwrapped and isinstance(q_unwrapped["questions"], list):
                questions = q_unwrapped["questions"]
            elif isinstance(q_unwrapped, list):
                questions = [str(x) for x in q_unwrapped]
            else:
                for k, v in (q_unwrapped.items() if isinstance(q_unwrapped, dict) else []):
                    if isinstance(v, list) and all(isinstance(i, str) for i in v):
                        questions = v
                        break
        if questions:
            print("[start_interview] LLM provided questions count:", len(questions))
        else:
            print("[start_interview] LLM returned no usable questions; will fallback.")
    except Exception as e:
        print("[start_interview] question generation exception:", e)

    # Fallback heuristics to ensure minimum resume-based questions (minimum 15)
    if not questions:
        print("[start_interview] using heuristic question generator fallback")
        questions = utils.generate_questions_from_parsed(parsed, max_questions=8)

    # If LLM/heuristic produced less than 15 resume questions, generate more heuristics
    if len(questions) < 15:
        extras = utils.generate_questions_from_parsed(parsed, max_questions=30)
        # combine preserving existing order and ensuring uniqueness
        combined = list(dict.fromkeys(questions + extras))
        questions = combined[:15]  # ensure at least up to 15 (or fewer if not available)
        print("[start_interview] ensured minimum resume questions:", len(questions))

    # Now append 10 CS fundamentals chosen from the combined bank (ensure no duplicates)
    cs_bank = COMBINED_CS_BANK.copy()
    # remove any questions already in 'questions'
    cs_bank = [q for q in cs_bank if q not in questions]
    cs_to_add = []
    try:
        if len(cs_bank) >= 10:
            cs_to_add = random.sample(cs_bank, 10)
        else:
            cs_to_add = cs_bank[:10]
    except Exception:
        # fallback deterministic selection
        cs_to_add = cs_bank[:10]

    final_questions = questions + cs_to_add

    # normalize: ensure strings and safe shape
    normalized_qs = []
    for q in final_questions:
        if isinstance(q, dict):
            normalized_qs.append(q.get("question") or json.dumps(q))
        else:
            normalized_qs.append(str(q))

    interview = models.Interview(user_id=current_user.id)
    interview.set_questions(normalized_qs)
    interview.set_answers([])
    interview.set_analysis({"resume_summary": summary_data, "resume_keywords": resume_keywords})
    created = crud.create_interview(db, interview)
    first_q = normalized_qs[0] if normalized_qs else None
    print(f"[start_interview] created interview id={created.id} questions={len(normalized_qs)}")
    return {"interview_id": created.id, "first_question": first_q}


@router.get("/{interview_id}")
def get_interview(interview_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    return {
        "id": interview.id,
        "questions": interview.get_questions(),
        "answers": interview.get_answers(),
        "analysis": interview.get_analysis(),
        "created_at": interview.created_at,
    }


@router.post("/{interview_id}/answer", response_model=schemas.SimpleScore)
def submit_answer(interview_id: int, payload: schemas.AnswerPayload, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = interview.get_questions()
    if payload.question_index < 0 or payload.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    qtext_raw = questions[payload.question_index]
    qtext = qtext_raw.get("question") if isinstance(qtext_raw, dict) and "question" in qtext_raw else qtext_raw

    # Prefer transcript text if provided
    answer_text = payload.answer or ""
    transcript_meta = getattr(payload, "transcript_meta", None)
    if transcript_meta and isinstance(transcript_meta, dict) and transcript_meta.get("text"):
        answer_text = transcript_meta.get("text")

    print(f"[submit_answer] interview={interview_id} idx={payload.question_index}")
    print(f"[submit_answer] question (short): {str(qtext)[:160]}")
    print(f"[submit_answer] answer (short): {answer_text[:200]}")

    # Attempt LLM evaluation if configured, else use heuristic fallback
    score_obj = None
    if LLM_FORCE_EVAL:
        try:
            eval_prompt = prompt_evaluate_answer(qtext, answer_text, resume_text=json.dumps(interview.get_analysis().get("resume_summary", {})))
            print("[submit_answer] calling LLM for full evaluation...")
            llm_eval = generate_with_llm(eval_prompt, model=LLM_MODEL_ENV, timeout=LLM_TIMEOUT_LONG)
            print("[submit_answer] llm eval ok:", llm_eval.get("ok"), "error:", llm_eval.get("error"))
            eval_unwrapped = _unwrap_llm_resp(llm_eval)
            if isinstance(eval_unwrapped, dict):
                score_obj = eval_unwrapped
                print("[submit_answer] LLM evaluation used; overall:", score_obj.get("overall_score"))
        except Exception as e:
            print("[submit_answer] LLM evaluation error:", e)

    if not score_obj:
        print("[submit_answer] using heuristic scoring fallback")
        expected = re.findall(r"\w+", str(qtext))[:12] if qtext else []
        score_obj = utils.score_answer_text(answer_text, expected_keywords=[w for w in expected], transcript_meta=transcript_meta)
        if isinstance(score_obj, dict):
            if "overall_score" not in score_obj:
                score_obj["overall_score"] = int(score_obj.get("score", 0))
            score_obj.setdefault("technical", int(score_obj.get("technical", 0)))
            score_obj.setdefault("communication", int(score_obj.get("communication", 0)))
            score_obj.setdefault("depth", int(score_obj.get("depth", 0)))
            score_obj.setdefault("resume_match", int(score_obj.get("resume_bonus", 0)))
        else:
            score_obj = {
                "overall_score": int(score_obj) if isinstance(score_obj, (int, float)) else 0,
                "technical": 0, "communication": 0, "depth": 0, "resume_match": 0,
                "strengths": [], "weaknesses": [], "tips": []
            }
        print("[submit_answer] heuristic overall:", score_obj.get("overall_score"))

    # Normalize numeric bounds
    score_obj["overall_score"] = _normalize_int_safe(score_obj.get("overall_score", score_obj.get("score", 0)))
    score_obj["technical"] = _normalize_int_safe(score_obj.get("technical", 0))
    score_obj["communication"] = _normalize_int_safe(score_obj.get("communication", 0))
    score_obj["depth"] = _normalize_int_safe(score_obj.get("depth", 0))
    score_obj["resume_match"] = _normalize_int_safe(score_obj.get("resume_match", 0))
    score_obj.setdefault("strengths", [])
    score_obj.setdefault("weaknesses", [])
    score_obj.setdefault("tips", [])

    # Append answer record
    answers = interview.get_answers() or []
    answers.append({
        "question_index": payload.question_index,
        "question": qtext,
        "answer": answer_text,
        "score": score_obj,
        "transcript_meta": transcript_meta
    })
    interview.set_answers(answers)
    crud.save_interview(db, interview)
    print(f"[submit_answer] saved; total answers now: {len(answers)}")

    # Follow-up generation
    follow_ups: List[str] = []
    try:
        fu_prompt = prompt_follow_up(qtext, answer_text)
        print("[submit_answer] requesting LLM follow-up (quick)...")
        fu_resp = generate_with_llm(fu_prompt, model=LLM_MODEL_ENV, timeout=LLM_TIMEOUT_SHORT)
        print("[submit_answer] fu raw ok:", fu_resp.get("ok"), "error:", fu_resp.get("error"))
        fu_unwrapped = _unwrap_llm_resp(fu_resp)
        if isinstance(fu_unwrapped, dict) and "follow_up" in fu_unwrapped:
            fu = fu_unwrapped.get("follow_up")
            if fu:
                follow_ups.append(str(fu))
                print("[submit_answer] LLM follow-up:", fu)
        elif isinstance(fu_unwrapped, str):
            follow_ups.append(fu_unwrapped)
            print("[submit_answer] LLM follow-up (string):", fu_unwrapped)
    except Exception as e:
        print("[submit_answer] LLM follow-up error:", e)

    if not follow_ups:
        key_noun = None
        m = re.search(r"(project|module|service|database|api|algorithm|function|component|model|schema|index)", str(qtext), re.I)
        if m:
            key_noun = m.group(1)
        follow_ups.append(f"For the previous answer, explain the key design decision for the {key_noun or 'component'} in more detail.")
        follow_ups.append("What testing strategy and edge-case handling would you implement for this part of the system?")

    # Insert follow-ups after current question index (prevent unlimited insertion)
    qs = interview.get_questions() or []
    insert_at = payload.question_index + 1
    # limit follow-ups to 2
    for i, fu in enumerate(follow_ups[:2]):
        if insert_at + i <= len(qs):
            qs.insert(insert_at + i, fu)
        else:
            qs.append(fu)
    interview.set_questions(qs)
    crud.save_interview(db, interview)
    if follow_ups:
        print(f"[submit_answer] appended {len(follow_ups[:2])} follow-up(s) at index {insert_at}")

    return {
        "score": score_obj.get("overall_score"),
        "technical": score_obj.get("technical"),
        "communication": score_obj.get("communication"),
        "details": score_obj
    }


@router.post("/{interview_id}/finish")
def finish_interview(interview_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    answers = interview.get_answers() or []
    if not answers:
        raise HTTPException(status_code=400, detail="No answers submitted")

    # Aggregate metrics robustly
    total_scores = []
    technicals = []
    comms = []
    depths = []
    resume_matches = []
    strengths_acc: Dict[str, int] = {}
    weaknesses_acc: Dict[str, int] = {}
    tips_acc: Dict[str, int] = {}

    for a in answers:
        s = a.get("score") or {}
        overall = s.get("overall_score") or s.get("score") or 0
        technicals.append(int(s.get("technical", 0)))
        comms.append(int(s.get("communication", 0)))
        depths.append(int(s.get("depth", 0)))
        resume_matches.append(int(s.get("resume_match", 0)))
        total_scores.append(int(overall))

        # aggregate strengths/weaknesses keywords
        for st in (s.get("strengths") or []):
            strengths_acc[st] = strengths_acc.get(st, 0) + 1
        for wk in (s.get("weaknesses") or []):
            weaknesses_acc[wk] = weaknesses_acc.get(wk, 0) + 1
        for tip in (s.get("tips") or []):
            tips_acc[tip] = tips_acc.get(tip, 0) + 1

    avg_score = int(sum(total_scores) / len(total_scores))
    technical_avg = int(sum(technicals) / max(1, len(technicals)))
    communication_avg = int(sum(comms) / max(1, len(comms)))
    depth_avg = int(sum(depths) / max(1, len(depths)))
    resume_match_avg = int(sum(resume_matches) / max(1, len(resume_matches)))

    # top strengths/weaknesses
    top_strengths = sorted(strengths_acc.items(), key=lambda x: -x[1])[:5]
    top_weaknesses = sorted(weaknesses_acc.items(), key=lambda x: -x[1])[:8]
    top_tips = sorted(tips_acc.items(), key=lambda x: -x[1])[:8]

    # Derive prioritized improvement tips
    improvement_tips = []

    if technical_avg < 60:
        improvement_tips.append("Strengthen core technical knowledge: data structures, algorithms, and system design. Practice explaining algorithmic complexity (Big-O) for each approach.")
    else:
        improvement_tips.append("Technical fundamentals look solid — focus on deeper tradeoff discussions and complexity analysis.")

    if communication_avg < 60:
        improvement_tips.append("Work on structured answers: use STAR / Problem→Approach→Result format and practice concise speech (aim 120-160 wpm).")
    else:
        improvement_tips.append("Communication is good — aim to be more concise and avoid filler words when under time pressure.")

    if depth_avg < 50:
        improvement_tips.append("Provide deeper design and edge-case reasoning. For each solution, mention performance, scalability, and failure modes.")
    else:
        improvement_tips.append("Depth is acceptable — add concrete micro-optimizations / benchmarks when possible.")

    if resume_match_avg < 50:
        improvement_tips.append("Tie answers explicitly to projects on your resume — mention modules, technologies, and measurable outcomes (e.g., 'reduced latency by 30%').")
    else:
        improvement_tips.append("Good resume alignment. Continue referencing concrete project artifacts during answers.")

    # Consolidated recommended 4-week study plan (practical)
    study_plan = [
        "Week 1 — Data Structures & Algorithms (Arrays, Hashmaps, Trees, Graphs). Solve 10 problems and articulate approach & complexity.",
        "Week 2 — System Design Basics (APIs, Databases, Caching, Indexing). Draw architecture diagrams and state tradeoffs.",
        "Week 3 — OOP & Code Quality (SOLID, patterns, refactoring). Build small modules and write unit tests.",
        "Week 4 — OS & Networks fundamentals (threads, memory, sockets), plus mock interviews and timed practice."
    ]

    # Specific actionable items from top weaknesses
    actionable_from_weaknesses = []
    for wk, cnt in top_weaknesses[:5]:
        actionable_from_weaknesses.append(f"{wk} — practice focused Q&A and give an example next time.")

    analysis = {
        "overall_score": avg_score,
        "by_category": {
            "technical_avg": technical_avg,
            "communication_avg": communication_avg,
            "depth_avg": depth_avg,
            "resume_match_avg": resume_match_avg
        },
        "top_strengths": [s for s, _ in top_strengths],
        "top_weaknesses": [w for w, _ in top_weaknesses],
        "aggregated_tips": [t for t, _ in top_tips],
        "improvement_tips": improvement_tips,
        "actionable_from_weaknesses": actionable_from_weaknesses,
        "suggested_4_week_plan": study_plan,
        "detailed_per_answer": answers  # include raw answers+scores for inspection by frontend
    }

    interview.set_analysis(analysis)
    crud.save_interview(db, interview)
    print(f"[finish_interview] interview={interview_id} final analysis:", analysis)
    return analysis


@router.get("/")
def list_interviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = crud.list_user_interviews(db, current_user.id)
    return [
        {
            "id": i.id,
            "created_at": i.created_at,
            "questions_count": len(i.get_questions()),
            "answers_count": len(i.get_answers()),
            "analysis": i.get_analysis(),
        }
        for i in items
    ]
