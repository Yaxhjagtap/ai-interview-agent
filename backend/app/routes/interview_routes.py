# backend/app/routes/interview_routes.py
import os
import re
import sys
import json
import random
import logging
from typing import List, Any, Optional, Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas, utils
from ..routes.user_routes import get_current_user, get_db
from ..services.llm_service import generate_with_llm, unwrap_llm_json

# ─── Configure Strict Terminal Logging ───────────────────────────────────────
logger = logging.getLogger("interview_routes")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)

# ─── Inline prompt fallbacks ──────────────
try:
    from ..interview_engine.llm_prompts import (
        prompt_evaluate_answer,
        prompt_summarize_resume,
    )
except ImportError:
    def prompt_summarize_resume(resume_text: str) -> str:
        trimmed = (resume_text or "")[:1800]
        return f"""
You are an expert technical recruiter reviewing a recent graduate's resume.
Extract the core technical skills and major projects. 
Return STRICT JSON only, no extra text, markdown, or commentary:
{{
   "core_skills": ["skill1", "skill2"],
   "projects": [{{"name": "Project Name", "tech": ["tech1"], "role": "Developer", "highlights": "Key achievement"}}]
}}

Resume:
\"\"\"{trimmed}\"\"\"

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text.
"""

    def prompt_evaluate_answer(question: str, answer: str, resume_text: str = "") -> str:
        short_resume = (resume_text or "")[:800]
        return f"""
You are an empathetic but thorough senior interviewer evaluating a candidate's answer.
Score them fairly. Reward clarity, honesty, and logical thinking.

Provide constructive feedback. Return STRICT JSON only:
{{
   "overall_score": 0-100,
   "technical": 0-100,
   "communication": 0-100,
   "depth": 0-100,
   "resume_match": 0-100,
   "strengths": ["One clear strength"],
   "weaknesses": ["One area to improve"],
   "tips": ["One actionable piece of advice for next time"]
}}

Question asked: {question}
Candidate's answer: {answer}
Resume context: {short_resume}

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text.
"""

router = APIRouter(prefix="/interviews", tags=["interviews"])

# Config - env-driven with sensible defaults
LLM_FORCE_EVAL = os.getenv("LLM_FORCE_EVAL", "false").lower() in ("1", "true", "yes")
LLM_MODEL_ENV = os.getenv("LLM_MODEL", "default-model")
SUMMARY_TRUNCATE = int(os.getenv("SUMMARY_TRUNCATE", "1500"))

AI_FAST_MODE = os.getenv("AI_FAST_MODE", "true").lower() in ("1", "true", "yes")
INCLUDE_EXPECTED_ANSWER = os.getenv("INCLUDE_EXPECTED_ANSWER", "false").lower() in ("1", "true", "yes")

LLM_TIMEOUT_SHORT = int(os.getenv("LLM_TIMEOUT_SHORT", "10"))
LLM_TIMEOUT_LONG = int(os.getenv("LLM_TIMEOUT_LONG", "25"))

TOTAL_QUESTION_COUNT = 20

# ─── Helpers ────────────────────────────────────────────────────────────────
def _normalize_int_safe(x: Any) -> int:
    if x is None: 
        return 0
    try:
        val = int(float(x))
        return max(0, min(100, val))
    except (ValueError, TypeError):
        return 0

def _local_expected_answer(question: str, answer: str) -> Dict[str, str]:
    q = (question or "").lower()
    if any(k in q for k in ["what is", "explain", "define", "difference"]):
        expected = "A clear definition accompanied by a brief, practical example."
    elif any(k in q for k in ["how did you", "implemented", "build", "project", "used"]):
        expected = "A structured response detailing the problem, your specific technical approach, and the final outcome (STAR method)."
    else:
        expected = "A concise, logical answer demonstrating fundamental understanding."
    return {"expected_answer": expected, "comparison": " Evaluated internally on clarity, technical accuracy, and completeness."}

def _interview_is_completed(interview) -> bool:
    qs = interview.get_questions() or []
    answers = interview.get_answers() or []
    return bool(qs) and len(answers) >= len(qs)

def _set_completion_state(interview, completed: bool, next_question_index: Optional[int] = None):
    analysis = interview.get_analysis() or {}
    analysis["completed"] = completed
    analysis["next_question_index"] = next_question_index
    interview.set_analysis(analysis)

def prompt_expected_answer(question: str, student_answer: str) -> str:
    q = (question or "")[:800]
    a = (student_answer or "")[:1200]
    return f"""
You are an expert technical mentor. Based on the interview question and the candidate's answer below, provide the ideal response.

Return STRICT JSON only:
{{ 
  "expected_answer": "A concise (2-3 sentence) exemplary answer a junior engineer should give.",
  "comparison": "A single sentence noting what the candidate did well and what they missed." 
}}

Question: {q}
Candidate's Answer: {a}

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text.
"""

# ─── Prompt Builders (Fixed to accept string parameters) ─────────────────────

def _build_resume_based_prompt(resume_data: str, experience: str, total_questions: int) -> str:
    """Build prompt for resume-based interviews"""
    trimmed_resume = (resume_data or "")[:1600]
    
    return f"""
You are a friendly, conversational senior engineer conducting a resume-based technical interview.

INTERVIEW CONTEXT:
- Type: Resume-Based Interview
- Candidate Experience Level: {experience or "Not specified"}
- Total Questions Needed: {total_questions}

CANDIDATE RESUME DATA:
\"\"\"{trimmed_resume}\"\"\"

YOUR TASK:
Generate exactly {total_questions} personalized interview questions based STRICTLY on the candidate's resume above.

QUESTION DISTRIBUTION:
1. First 70% (Questions 1-{int(total_questions * 0.7)}): Deep dive into specific projects, technologies, and experiences mentioned in the resume
   - Ask about specific technologies they used and why
   - Probe their role in projects described
   - Ask about challenges faced in their work
   - Question their technical decisions

2. Last 30% (Questions {int(total_questions * 0.7) + 1}-{total_questions}): General CS fundamentals
   - Data structures and algorithms
   - System design basics
   - OOP concepts
   - Database fundamentals

RULES:
- Questions must be conversational and natural
- Reference specific items from their resume (e.g., "I see you worked on...")
- Adjust difficulty based on experience level: {experience or "mixed"}
- NO generic questions that could apply to any candidate

Return STRICT JSON only:
{{ "questions": ["Question 1 text", "Question 2 text", ...] }}

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text before or after.
"""

def _build_company_based_prompt(company: str, role: str, experience: str, total_questions: int) -> str:
    """Build prompt for company-specific interviews"""
    
    return f"""
You are a senior technical interviewer conducting a company-specific interview for {company}.

INTERVIEW CONTEXT:
- Target Company: {company}
- Target Role: {role}
- Candidate Experience Level: {experience or "Not specified"}
- Total Questions Needed: {total_questions}

YOUR TASK:
Generate exactly {total_questions} interview questions tailored for a {role} position at {company}.

QUESTION DISTRIBUTION:
1. First 60% (Questions 1-{int(total_questions * 0.6)}): Company-specific technical and behavioral questions
   - Questions about {company}'s products, services, or tech stack
   - How the candidate would solve problems specific to {company}'s domain
   - Alignment with {company}'s culture and values
   - Scenarios relevant to {company}'s business

2. Middle 20% (Questions {int(total_questions * 0.6) + 1}-{int(total_questions * 0.8)}): Role-specific technical questions for {role}
   - Core competencies required for {role} at {company}
   - Technical depth appropriate for {experience or "this level"}

3. Last 20% (Questions {int(total_questions * 0.8) + 1}-{total_questions}): General problem-solving and CS fundamentals

RULES:
- Questions should reflect {company}'s interview style and difficulty
- Include both technical and behavioral questions
- Make questions specific to {company} - avoid generic "tell me about yourself"
- Consider {company}'s scale: ask about distributed systems, scalability if it's a big tech company
- Adjust technical depth for {experience or "the candidate's experience level"}

Return STRICT JSON only:
{{ "questions": ["Question 1 text", "Question 2 text", ...] }}

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text before or after.
"""

def _build_role_based_prompt(role: str, experience: str, total_questions: int) -> str:
    """Build prompt for role-specific interviews"""
    
    return f"""
You are a senior technical interviewer conducting a role-specific interview for a {role} position.

INTERVIEW CONTEXT:
- Target Role: {role}
- Candidate Experience Level: {experience or "Not specified"}
- Total Questions Needed: {total_questions}

YOUR TASK:
Generate exactly {total_questions} interview questions specifically for a {role} role.

QUESTION DISTRIBUTION:
1. First 60% (Questions 1-{int(total_questions * 0.6)}): Core {role} competencies
   - Essential technical skills for {role}
   - Tools, frameworks, and technologies commonly used by {role}s
   - Architecture and design questions relevant to {role}
   - Best practices and methodologies for {role}

2. Middle 20% (Questions {int(total_questions * 0.6) + 1}-{int(total_questions * 0.8)}): Experience-appropriate depth
   - For {experience or "this experience level"}, ask about:
     - {"Basic concepts and fundamentals" if experience == "fresher" else ""}
     - {"Practical implementation experience" if experience == "junior" else ""}
     - {"System design and architecture decisions" if experience in ["mid", "senior"] else ""}
     - {"Leadership, scaling, and strategic decisions" if experience == "senior" else ""}

3. Last 20% (Questions {int(total_questions * 0.8) + 1}-{total_questions}): General CS fundamentals and problem-solving

RULES:
- Focus entirely on {role}-specific knowledge and skills
- Questions should be practical and job-relevant
- Adjust complexity for {experience or "the specified"} experience level
- Include scenario-based questions ("How would you handle...")
- NO questions about specific companies or personal resume items

Return STRICT JSON only:
{{ "questions": ["Question 1 text", "Question 2 text", ...] }}

CRITICAL: Return ONLY the JSON object. No markdown formatting, no ```json blocks, no extra text before or after.
"""

# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/start", response_model=schemas.StartInterviewResp)
def start_interview(
    payload: schemas.StartInterviewRequest,  # Now uses the fixed schema with string interview_type
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.info("="*60)
    logger.info(f"🚀 [START] User {current_user.id} starting interview")
    
    # interview_type is now a simple string (not an enum)
    interview_type = payload.interview_type
    logger.info(f"📋 [PAYLOAD] Type: {interview_type}, Company: {payload.company}, Role: {payload.role}, Exp: {payload.experience}")

    # Validation based on interview type (using string comparison)
    if interview_type == "company":
        if not payload.company or not payload.role:
            logger.error("❌ [START] Missing company or role for company interview")
            raise HTTPException(status_code=400, detail="Company and role are required for company-specific interviews")
    
    elif interview_type == "role":
        if not payload.role:
            logger.error("❌ [START] Missing role for role interview")
            raise HTTPException(status_code=400, detail="Role is required for role-specific interviews")
    
    elif interview_type == "resume":
        if not current_user.resume_path:
            logger.error("❌ [START] Missing resume for resume-based interview")
            raise HTTPException(status_code=400, detail="Resume upload required for resume-based interviews")

    summary_data = {}
    resume_text = ""
    resume_keywords = []

    # Extract resume data ONLY for resume-based interviews
    if interview_type == "resume":
        logger.info("📄 [START] Processing resume for resume-based interview...")
        try:
            resume_text = utils.extract_text_from_pdf(current_user.resume_path) or ""
            parsed = utils.parse_resume_text(resume_text)
            resume_keywords = parsed.get("keywords", [])[:80]
            
            if resume_text:
                sum_prompt = prompt_summarize_resume(resume_text[:SUMMARY_TRUNCATE])
                sum_resp = generate_with_llm(
                    sum_prompt,
                    model=LLM_MODEL_ENV,
                    timeout=LLM_TIMEOUT_SHORT if AI_FAST_MODE else LLM_TIMEOUT_LONG,
                    fast=AI_FAST_MODE,
                )
                unwrapped = unwrap_llm_json(sum_resp)
                if isinstance(unwrapped, dict) and ("core_skills" in unwrapped or "projects" in unwrapped):
                    summary_data = unwrapped
                    logger.info(f"✅ [START] Resume summary generated: {len(summary_data.get('core_skills', []))} skills, {len(summary_data.get('projects', []))} projects")
                else:
                    logger.warning("⚠️ [START] Resume summary returned invalid format")
                    summary_data = {"raw_text_preview": resume_text[:500]}
        except Exception as e:
            logger.warning(f"⚠️ [START] Resume processing failed: {e}")
            summary_data = {"error": "Failed to parse resume", "raw_text_preview": resume_text[:500] if resume_text else ""}
    else:
        logger.info(f"⏩ [START] Skipping resume processing for {interview_type} interview")

    # Generate questions using type-specific prompts
    final_questions = []
    try:
        # Select appropriate prompt builder based on interview type (string comparison)
        if interview_type == "resume":
            prompt = _build_resume_based_prompt(
                json.dumps(summary_data, ensure_ascii=False) if summary_data else resume_text,
                payload.experience or "",
                TOTAL_QUESTION_COUNT
            )
        elif interview_type == "company":
            prompt = _build_company_based_prompt(
                payload.company,
                payload.role,
                payload.experience or "",
                TOTAL_QUESTION_COUNT
            )
        elif interview_type == "role":
            prompt = _build_role_based_prompt(
                payload.role,
                payload.experience or "",
                TOTAL_QUESTION_COUNT
            )
        else:
            raise ValueError(f"Unknown interview type: {interview_type}")

        logger.info(f"🤖 [START] Calling LLM with {interview_type}-specific prompt...")
        
        resp = generate_with_llm(
            prompt,
            model=LLM_MODEL_ENV,
            timeout=LLM_TIMEOUT_LONG if AI_FAST_MODE else LLM_TIMEOUT_LONG * 2,
            fast=AI_FAST_MODE,
        )
        
        # Parse LLM response
        unwrapped = unwrap_llm_json(resp)
        
        if isinstance(unwrapped, dict) and "questions" in unwrapped:
            raw_questions = unwrapped["questions"]
            if isinstance(raw_questions, list):
                final_questions = [str(q).strip() for q in raw_questions if str(q).strip()]
            else:
                raise ValueError(f"LLM returned 'questions' as {type(raw_questions)}, expected list")
        elif isinstance(unwrapped, list):
            final_questions = [str(q).strip() for q in unwrapped if str(q).strip()]
        else:
            raise ValueError(f"LLM returned unexpected type: {type(unwrapped)}")

        logger.info(f"✅ [START] LLM generated {len(final_questions)} questions")

        # Trim if too many (no padding/fallbacks as requested)
        if len(final_questions) > TOTAL_QUESTION_COUNT:
            logger.info(f"✂️ [START] Trimming {len(final_questions)} to {TOTAL_QUESTION_COUNT}")
            final_questions = final_questions[:TOTAL_QUESTION_COUNT]
        
        # If too few, we accept what we got (no hardcoded fallbacks per request)
        if len(final_questions) < TOTAL_QUESTION_COUNT:
            logger.warning(f"⚠️ [START] LLM returned only {len(final_questions)}/{TOTAL_QUESTION_COUNT} questions. Proceeding with available questions.")

    except Exception as e:
        logger.error(f"💥 [START] Question generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {str(e)}")

    if not final_questions:
        logger.error("❌ [START] No questions generated")
        raise HTTPException(status_code=500, detail="No questions were generated. Please try again.")

    # Determine Title for UI
    if interview_type == "company":
        title_meta = f"{payload.company} - {payload.role}"
    elif interview_type == "role":
        title_meta = f"{payload.role} Role"
    else:
        title_meta = "Resume Based"

    # DB Persistence
    interview = models.Interview(user_id=current_user.id)
    interview.set_questions(final_questions)
    interview.set_answers([])
    
    analysis_data = {
        "interview_title": f"{title_meta} ({payload.experience or 'General'})",
        "interview_config": {
            "type": interview_type,  # Store as string
            "company": payload.company,
            "role": payload.role,
            "experience": payload.experience
        },
        "resume_summary": summary_data if interview_type == "resume" else None,
        "resume_keywords": resume_keywords if interview_type == "resume" else [],
        "question_mode": f"llm_{interview_type}_generation",
        "total_question_count": len(final_questions),
        "completed": False,
        "next_question_index": 0,
    }
    interview.set_analysis(analysis_data)

    created = crud.create_interview(db, interview)
    first_q = final_questions[0] if final_questions else None

    logger.info(f"🎉 [START] Interview {created.id} created with {len(final_questions)} questions")
    logger.info("="*60)
    
    return {
        "interview_id": created.id, 
        "first_question": first_q, 
        "total_questions": len(final_questions)
    }


@router.get("/{interview_id}")
def get_interview(interview_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found or access denied")

    questions = interview.get_questions() or []
    answers = interview.get_answers() or []
    completed = _interview_is_completed(interview)
    next_idx = None if completed else len(answers)

    is_currently_last_question = (next_idx == len(questions) - 1) if not completed else True

    return {
        "id": interview.id,
        "questions": questions,
        "answers": answers,
        "analysis": interview.get_analysis(),
        "created_at": interview.created_at,
        "is_completed": completed,
        "next_question_index": next_idx,
        "current_question": None if completed or next_idx is None or next_idx >= len(questions) else questions[next_idx],
        "remaining_questions": max(0, len(questions) - len(answers)),
        "total_questions": len(questions),
        "is_last_question": is_currently_last_question,
    }


@router.post("/{interview_id}/answer")
def submit_answer(
    interview_id: int,
    payload: schemas.AnswerPayload,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.info(f"🎙️ [ANSWER] User {current_user.id} submitting answer for interview {interview_id}, Q-Index {payload.question_index}")
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = interview.get_questions() or []
    if not questions:
        raise HTTPException(status_code=400, detail="Interview contains no questions")

    if _interview_is_completed(interview):
        raise HTTPException(status_code=409, detail="Interview already completed")

    if payload.question_index < 0 or payload.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    answers = interview.get_answers() or []
    expected_index = len(answers)
    
    if payload.question_index != expected_index:
        raise HTTPException(status_code=409, detail=f"Expected question index {expected_index}, got {payload.question_index}")

    qtext_raw = questions[payload.question_index]
    qtext = qtext_raw.get("question") if isinstance(qtext_raw, dict) and "question" in qtext_raw else qtext_raw

    answer_text = payload.answer or ""
    transcript_meta = getattr(payload, "transcript_meta", None)
    if transcript_meta and isinstance(transcript_meta, dict) and transcript_meta.get("text"):
        answer_text = transcript_meta.get("text")

    score_obj = None
    if LLM_FORCE_EVAL:
        try:
            logger.info(f"🤖 [ANSWER] Running LLM Evaluation...")
            # Get resume summary if available
            analysis = interview.get_analysis() or {}
            resume_summary = analysis.get("resume_summary", {})
            
            eval_prompt = prompt_evaluate_answer(
                qtext,
                answer_text,
                resume_text=json.dumps(resume_summary) if resume_summary else ""
            )
            llm_eval = generate_with_llm(
                eval_prompt,
                model=LLM_MODEL_ENV,
                timeout=LLM_TIMEOUT_SHORT if AI_FAST_MODE else LLM_TIMEOUT_LONG,
                fast=AI_FAST_MODE,
            )
            eval_unwrapped = unwrap_llm_json(llm_eval)
            if isinstance(eval_unwrapped, dict):
                score_obj = eval_unwrapped
                logger.info(f"✅ [ANSWER] LLM Evaluation: {score_obj.get('overall_score')}/100")
        except Exception as e:
            logger.warning(f"⚠️ [ANSWER] LLM eval failed: {e}")

    if not score_obj:
        logger.info(f"⚙️ [ANSWER] Using heuristic scoring...")
        expected_keywords = list(set(re.findall(r"\w+", str(qtext).lower())))[:15]
        score_obj = utils.score_answer_text(
            answer_text,
            expected_keywords=expected_keywords,
            transcript_meta=transcript_meta
        )
        if not isinstance(score_obj, dict):
            fallback_score = int(score_obj) if isinstance(score_obj, (int, float)) else 50
            score_obj = {
                "overall_score": fallback_score,
                "technical": fallback_score,
                "communication": fallback_score,
                "depth": fallback_score,
                "resume_match": fallback_score,
                "strengths": ["Clear delivery"] if len(answer_text) > 50 else [],
                "weaknesses": ["Answer lacked depth"] if len(answer_text) < 50 else [],
                "tips": ["Try to elaborate more on your thought process."],
            }

    score_obj = {
        "overall_score": _normalize_int_safe(score_obj.get("overall_score", score_obj.get("score", 0))),
        "technical": _normalize_int_safe(score_obj.get("technical", 0)),
        "communication": _normalize_int_safe(score_obj.get("communication", 0)),
        "depth": _normalize_int_safe(score_obj.get("depth", 0)),
        "resume_match": _normalize_int_safe(score_obj.get("resume_match", 0)),
        "strengths": score_obj.get("strengths", []),
        "weaknesses": score_obj.get("weaknesses", []),
        "tips": score_obj.get("tips", []),
    }

    answers.append({
        "question_index": payload.question_index,
        "question": qtext,
        "answer": answer_text,
        "score": score_obj,
        "transcript_meta": transcript_meta,
    })
    interview.set_answers(answers)

    next_question_index = payload.question_index + 1
    completed = next_question_index >= len(questions)
    is_currently_last_question = (next_question_index == len(questions) - 1) if not completed else True
    _set_completion_state(interview, completed=completed, next_question_index=None if completed else next_question_index)

    crud.save_interview(db, interview)

    expected_payload = _local_expected_answer(qtext, answer_text)
    expected_answer: str = expected_payload["expected_answer"]
    comparison: str = expected_payload["comparison"]

    if INCLUDE_EXPECTED_ANSWER:
        try:
            logger.info("🤖 [ANSWER] Generating expected answer via LLM...")
            exp_prompt = prompt_expected_answer(qtext, answer_text)
            exp_resp = generate_with_llm(
                exp_prompt,
                model=LLM_MODEL_ENV,
                timeout=LLM_TIMEOUT_SHORT,
                fast=AI_FAST_MODE,
            )
            exp_unwrapped = unwrap_llm_json(exp_resp)
            if isinstance(exp_unwrapped, dict):
                expected_answer = exp_unwrapped.get("expected_answer", expected_answer)
                comparison = exp_unwrapped.get("comparison", comparison)
        except Exception as e:
            logger.warning(f"⚠️ [ANSWER] Expected-answer LLM failed: {e}")

    logger.info(f"✅ [ANSWER] Recorded answer for Q{payload.question_index + 1}")
    return {
        "score": score_obj["overall_score"],
        "technical": score_obj["technical"],
        "communication": score_obj["communication"],
        "details": score_obj,
        "expected_answer": expected_answer,
        "comparison": comparison,
        "is_last_question": is_currently_last_question,
        "interview_completed": completed,
        "next_question_index": None if completed else next_question_index,
        "next_question": None if completed else questions[next_question_index],
        "questions_count": len(questions),
        "answers_count": len(answers),
    }


@router.post("/{interview_id}/finish")
def finish_interview(interview_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.info(f"🏁 [FINISH] User {current_user.id} finishing interview {interview_id}")
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    answers = interview.get_answers() or []
    if not answers:
        raise HTTPException(status_code=400, detail="Cannot finish interview with no submitted answers")

    total_scores, technicals, comms, depths, resume_matches = [], [], [], [], []
    strengths_acc: Dict[str, int] = {}
    weaknesses_acc: Dict[str, int] = {}
    tips_acc: Dict[str, int] = {}

    for a in answers:
        s = a.get("score") or {}
        total_scores.append(_normalize_int_safe(s.get("overall_score") or s.get("score")))
        technicals.append(_normalize_int_safe(s.get("technical")))
        comms.append(_normalize_int_safe(s.get("communication")))
        depths.append(_normalize_int_safe(s.get("depth")))
        resume_matches.append(_normalize_int_safe(s.get("resume_match")))

        for st in (s.get("strengths") or []): strengths_acc[st] = strengths_acc.get(st, 0) + 1
        for wk in (s.get("weaknesses") or []): weaknesses_acc[wk] = weaknesses_acc.get(wk, 0) + 1
        for tip in (s.get("tips") or []): tips_acc[tip] = tips_acc.get(tip, 0) + 1

    ans_len = max(1, len(answers))
    avg_score = int(sum(total_scores) / ans_len)
    technical_avg = int(sum(technicals) / ans_len)
    communication_avg = int(sum(comms) / ans_len)
    depth_avg = int(sum(depths) / ans_len)
    resume_match_avg = int(sum(resume_matches) / ans_len)

    top_strengths = [k for k, _ in sorted(strengths_acc.items(), key=lambda x: -x[1])[:5]]
    top_weaknesses = [k for k, _ in sorted(weaknesses_acc.items(), key=lambda x: -x[1])[:8]]
    top_tips = [k for k, _ in sorted(tips_acc.items(), key=lambda x: -x[1])[:8]]

    improvement_tips = []
    if technical_avg < 60:
        improvement_tips.append("Strengthen core technical knowledge. Focus on being able to concisely explain how your tools work under the hood.")
    else:
        improvement_tips.append("Technical fundamentals look solid! To take it to the next level, start discussing edge-cases and performance trade-offs.")

    if communication_avg < 60:
        improvement_tips.append("Structure is key. Try using the STAR method (Situation, Task, Action, Result) so your answers don't wander.")
    else:
        improvement_tips.append("Strong communication. You articulated your points well. Continue refining your technical explanations to be punchy.")

    study_plan = [
        "Week 1: Foundations - Review core principles of your primary language and common data structures.",
        "Week 2: Systems - Practice explaining database behaviors (indexing, joins) and basic API architecture.",
        "Week 3: Code Design - Brush up on OOP, SOLID principles, and clean code practices.",
        "Week 4: Mocking - Conduct 2-3 behavioral and technical mock interviews focusing specifically on your weak points.",
    ]

    actionable_from_weaknesses = [f"{wk} — Prioritize this in your study plan this week." for wk in top_weaknesses[:5]]

    analysis = interview.get_analysis() or {}
    analysis.update({
        "overall_score": avg_score,
        "by_category": {
            "technical_avg": technical_avg,
            "communication_avg": communication_avg,
            "depth_avg": depth_avg,
            "resume_match_avg": resume_match_avg,
        },
        "top_strengths": top_strengths,
        "top_weaknesses": top_weaknesses,
        "aggregated_tips": top_tips,
        "improvement_tips": improvement_tips,
        "actionable_from_weaknesses": actionable_from_weaknesses,
        "suggested_4_week_plan": study_plan,
        "detailed_per_answer": answers,
        "completed": True,
        "next_question_index": None,
    })

    interview.set_analysis(analysis)
    crud.save_interview(db, interview)
    
    logger.info(f"✅ [FINISH] Interview {interview_id} finalized. Score: {avg_score}")
    return analysis


@router.get("/")
def list_interviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = crud.list_user_interviews(db, current_user.id)
    return [
        {
            "id": i.id,
            "created_at": i.created_at,
            "questions_count": len(i.get_questions() or []),
            "answers_count": len(i.get_answers() or []),
            "analysis": i.get_analysis(),
        }
        for i in items
    ]