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
    # --- Fresher-level prompt templates (English as default) ---
    def prompt_summarize_resume(resume_text: str) -> str:
        trimmed = (resume_text or "")[:1500]
        return f"""
You are an interviewer summarizing a candidate's resume (ENGLISH).
Return STRICT JSON only with:
{{ "core_skills": ["skill1","skill2"], "projects": [{{"name":"p","tech":["t"],"role":"r"}}] }}

Resume (ENGLISH):
\"\"\"{trimmed}\"\"\"
"""

    def prompt_generate_questions(resume_text: str, max_questions: int = 8) -> str:
        """
        Fresher-level question generator:
         - Focus on resume projects, implementation details and beginner CS fundamentals.
         - Avoid senior-level system design; keep questions accessible for fresh graduates.
        """
        trimmed = (resume_text or "")[:1200]
        return f"""
You are a calm, professional interviewer speaking English. The candidate is a FRESHER (recent graduate).

Based ONLY on this resume fragment, produce up to {max_questions} simple, beginner-level questions.
Focus categories:
  - Resume project implementation details (what you did, libraries, challenges, metrics)
  - OOP basic concepts
  - DBMS basic concepts
  - OS basic concepts
  - Computer networks basic concepts

Keep each question short and clear (one sentence). Avoid complex system-design or senior architecture questions.

Return STRICT JSON:
{{ "questions": ["q1","q2", ...] }}

Resume (ENGLISH):
\"\"\"{trimmed}\"\"\"
"""

    def prompt_evaluate_answer(question: str, answer: str, resume_text: str = "") -> str:
        short_resume = (resume_text or "")[:1000]
        return f"""
You are a senior interviewer evaluating a FRESHER. Return STRICT JSON only:

{{ "overall_score": 0, "technical": 0, "communication": 0, "depth": 0, "resume_match": 0,
  "strengths": [], "weaknesses": [], "tips": [] }}

Language: English

Question:
{question}

Candidate answer:
{answer}

Resume (short):
{short_resume}
"""

    def prompt_follow_up(question: str, answer: str) -> str:
        return f"""
You are interviewing a fresher in English. Ask exactly ONE short follow-up to check conceptual clarity (not deep design).

Return STRICT JSON:
{{ "follow_up": "..." }}

Original question:
{question}

Candidate answer:
{answer}
"""

router = APIRouter(prefix="/interviews", tags=["interviews"])

# Config - keep same env-driven config
LLM_FORCE_EVAL = os.getenv("LLM_FORCE_EVAL", "false").lower() in ("1", "true", "yes")
LLM_MODEL_ENV = os.getenv("LLM_MODEL")
SUMMARY_TRUNCATE = int(os.getenv("SUMMARY_TRUNCATE", "1500"))
LLM_TIMEOUT_SHORT = int(os.getenv("LLM_TIMEOUT_SHORT", "40"))
LLM_TIMEOUT_LONG = int(os.getenv("LLM_TIMEOUT_LONG", "90"))

# ============================================================
# Predefined CS fundamentals bank (OOP/DBMS/OS/CN) - kept as fresher-friendly Qs
# (Use your existing banks; shortened here for readability)
# ============================================================
OOP_QS = [
    "What is encapsulation and why is it useful?",
    "Explain inheritance with an example.",
    "What is polymorphism? Give a simple example.",
    "What is an interface vs an abstract class (short)?",
    "What are SOLID principles (brief)?" ,
    "What is composition and why prefer it sometimes?",
    "How does method overriding differ from overloading?",
    "What is a design pattern? Name one and explain briefly.",
    "How would you unit test an OOP class?",
    "What is an immutable object?"
]

DBMS_QS = [
    "What is normalization and why do we normalize?",
    "What is an index and how does it help queries?",
    "What is a transaction and ACID briefly?",
    "When can denormalization help performance?",
    "What is a foreign key?",
    "What is the purpose of an execution plan?",
    "What is replication in databases?"
]

OS_QS = [
    "What is the difference between a process and a thread?",
    "What is a race condition?",
    "What is virtual memory in brief?",
    "What is a mutex vs semaphore?",
    "What is context switching?",
    "What is paging?"
]

CN_QS = [
    "Explain the TCP three-way handshake in short.",
    "What is UDP and when to use it?",
    "What is DNS?",
    "What is HTTP request/response lifecycle?",
    "What is TLS in brief?",
    "What is a socket?"
]

COMBINED_CS_BANK = OOP_QS + DBMS_QS + OS_QS + CN_QS

# -------------------------
# Helpers: robust JSON extraction from LLM responses
# -------------------------
def _try_parse_json_string(s: Optional[str]) -> Optional[Any]:
    if not s:
        return None
    s = s.strip()
    try:
        return json.loads(s)
    except Exception:
        pass
    s2 = s.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(s2)
    except Exception:
        pass
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
    if isinstance(parsed, dict):
        if any(k in parsed for k in ("core_skills", "projects", "questions", "follow_up", "expected_answer", "comparison")):
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
    if isinstance(parsed, (list, dict)):
        return parsed
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
# Prompt for expected answer + comparison (fresher-level)
# -------------------------
def prompt_expected_answer(question: str, student_answer: str) -> str:
    q = (question or "")[:800]
    a = (student_answer or "")[:1200]
    return f"""
You are a senior interviewer producing a short, beginner-level expected answer in ENGLISH for a fresher candidate.

Return STRICT JSON only:
{{ "expected_answer": "A concise (2-3 sentence) exemplary beginner-level answer in English.",
  "comparison": "A short (1-2 sentence) comparison noting strengths/missing points vs the candidate answer." }}

Question:
{q}

Candidate answer:
{a}
"""

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

    if len(questions) < 15:
        extras = utils.generate_questions_from_parsed(parsed, max_questions=30)
        combined = list(dict.fromkeys(questions + extras))
        questions = combined[:15]
        print("[start_interview] ensured minimum resume questions:", len(questions))

    # Append 10 CS fundamentals chosen from the combined bank (ensure no duplicates)
    cs_bank = COMBINED_CS_BANK.copy()
    cs_bank = [q for q in cs_bank if q not in questions]
    cs_to_add = []
    try:
        if len(cs_bank) >= 10:
            cs_to_add = random.sample(cs_bank, 10)
        else:
            cs_to_add = cs_bank[:10]
    except Exception:
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

    # Generate expected answer + comparison using LLM (best-effort, short timeout)
    expected_answer = None
    comparison = None
    try:
        exp_prompt = prompt_expected_answer(qtext, answer_text)
        exp_resp = generate_with_llm(exp_prompt, model=LLM_MODEL_ENV, timeout=LLM_TIMEOUT_SHORT)
        print("[submit_answer] expected-answer raw ok:", exp_resp.get("ok"), "error:", exp_resp.get("error"))
        exp_unwrapped = _unwrap_llm_resp(exp_resp)
        if isinstance(exp_unwrapped, dict):
            expected_answer = exp_unwrapped.get("expected_answer") or exp_unwrapped.get("expected")
            comparison = exp_unwrapped.get("comparison") or exp_unwrapped.get("compare")
        else:
            parsed = _try_parse_json_string(exp_resp.get("raw", "") or "")
            if isinstance(parsed, dict):
                expected_answer = parsed.get("expected_answer") or parsed.get("expected")
                comparison = parsed.get("comparison") or parsed.get("compare")
    except Exception as e:
        print("[submit_answer] expected-answer generation error:", e)

    if not expected_answer:
        expected_answer = "A concise, clear explanation covering main steps, reasoning, and tradeoffs."
    if not comparison:
        comparison = "Comparison unavailable: the student's answer will be compared to expected points; missing technical details or examples will reduce the technical score."

    # Follow-up generation (existing logic)
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
    for i, fu in enumerate(follow_ups[:2]):
        if insert_at + i <= len(qs):
            qs.insert(insert_at + i, fu)
        else:
            qs.append(fu)
    interview.set_questions(qs)
    crud.save_interview(db, interview)
    if follow_ups:
        print(f"[submit_answer] appended {len(follow_ups[:2])} follow-up(s) at index {insert_at}")

    # Return details including expected answer + comparison for frontend TTS
    return {
        "score": score_obj.get("overall_score"),
        "technical": score_obj.get("technical"),
        "communication": score_obj.get("communication"),
        "details": score_obj,
        "expected_answer": expected_answer,
        "comparison": comparison
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
        improvement_tips.append("Strengthen core technical knowledge: DS & algorithms and system basics. Practice explaining complexity.")
    else:
        improvement_tips.append("Technical fundamentals look solid — focus on concise tradeoffs and benchmarks.")

    if communication_avg < 60:
        improvement_tips.append("Work on structured answers: use STAR / Problem→Approach→Result format and practice clear speech (aim 120-160 wpm).")
    else:
        improvement_tips.append("Communication is good — reduce filler words under time pressure.")

    if depth_avg < 50:
        improvement_tips.append("Provide deeper design and edge-case reasoning where applicable.")
    else:
        improvement_tips.append("Depth is acceptable — add concrete examples or micro-optimizations.")

    if resume_match_avg < 50:
        improvement_tips.append("Tie answers explicitly to resume projects and outcomes.")
    else:
        improvement_tips.append("Good resume alignment — continue referencing modules and metrics.")

    # Consolidated recommended 4-week study plan (practical)
    study_plan = [
        "Week 1 — Data Structures & Algorithms: practice 10 problems and explain approach & complexity.",
        "Week 2 — Databases & Caching: indexing, query tuning, read replica basics, simple caching examples.",
        "Week 3 — OOP & Testing: SOLID principles, patterns, unit tests and small refactors.",
        "Week 4 — OS & Networks fundamentals: processes, threads, basic socket programming and mock interviews."
    ]

    actionable_from_weaknesses = []
    for wk, cnt in top_weaknesses[:5]:
        actionable_from_weaknesses.append(f"{wk} — practice short Q&A and prepare one concrete example next time.")

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
        "detailed_per_answer": answers
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
