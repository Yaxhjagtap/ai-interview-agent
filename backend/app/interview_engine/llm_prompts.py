# backend/app/interview_engine/llm_prompts.py
from typing import List

def prompt_generate_questions(resume_text: str, max_questions: int = 12) -> str:
    safe_resume = (resume_text or "").strip()

    return f"""
You are a senior technical interviewer.

STRICT INSTRUCTIONS:
- Output ONLY valid JSON.
- Do NOT include commentary.
- Do NOT include markdown.
- Do NOT include explanations.
- Return only one JSON object.

Required format:
{{
  "questions": ["Question 1", "Question 2", "..."]
}}

Generate up to {max_questions} high-quality, resume-specific technical interview questions.

Resume:
\"\"\"{safe_resume}\"\"\"
"""


def prompt_evaluate_answer(question: str, answer: str, resume_text: str = "") -> str:
    trimmed_resume = (resume_text or "")[:2000]

    return f"""
You are a senior software engineering interviewer.

STRICT RULES:
- Return ONLY valid JSON.
- No commentary.
- No markdown.
- No extra text.
- All numeric scores must be integers between 0 and 100.

Evaluate the candidate answer.

INPUT:
Question: {question}
Answer: {answer}
Resume: {trimmed_resume}

Required JSON format:
{{
  "overall_score": int,
  "technical": int,
  "communication": int,
  "depth": int,
  "resume_match": int,
  "strengths": ["short point"],
  "weaknesses": ["short point"],
  "tips": ["short actionable suggestion"]
}}
"""


def prompt_follow_up(question: str, answer: str) -> str:
    return f"""
You are a senior interviewer.

STRICT RULES:
- Return ONLY valid JSON.
- No commentary.
- No markdown.
- Only one follow-up question.

INPUT:
Question: {question}
Answer: {answer}

Required format:
{{ "follow_up": "..." }}
"""


def prompt_summarize_resume(resume_text: str) -> str:
    """
    Summarize resume into a small JSON structure that's easy for the LLM to
    reason over and generate focused questions from.
    """
    safe_resume = (resume_text or "")[:10000]
    return f"""
You are an expert technical recruiter and interviewer.

Task:
Read the resume text and produce a STRICT JSON summary (no commentary, no markdown).
Return exactly one JSON object with the following structure:

{{
  "candidate_name": "",
  "primary_role": "",
  "experience_level": "",            // e.g. "0-1 yrs", "1-3 yrs", "3-5 yrs", "5+ yrs"
  "core_skills": ["skill1", "skill2", "..."],
  "projects": [
    {{
      "name": "",
      "description": "",
      "tech_stack": ["tech1", "tech2"],
      "technical_challenges": ["challenge1", "challenge2"]
    }}
  ],
  "high_value_keywords": ["keyword1", "keyword2"]
}}

Resume:
\"\"\"{safe_resume}\"\"\"
"""
