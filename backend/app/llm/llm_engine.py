# app/llm/llm_engine.py

import json
import re
from typing import Dict

def detect_subject_from_question(question: str) -> str:
    q = question.lower()

    if any(k in q for k in ["class", "object", "inheritance", "polymorphism"]):
        return "OOP"
    if any(k in q for k in ["database", "normalization", "sql", "transaction"]):
        return "DBMS"
    if any(k in q for k in ["process", "thread", "deadlock", "scheduling"]):
        return "OS"
    if any(k in q for k in ["tcp", "udp", "http", "osi"]):
        return "CN"

    return "General"


def evaluate_answer_llm(
    resume_text: str,
    question: str,
    answer: str,
    company: str = "General"
) -> Dict:

    subject = detect_subject_from_question(question)

    # ---- Phase A: Smart Heuristic Engine (LLM-ready architecture) ----

    word_count = len(answer.split())
    length_score = min(word_count * 1.5, 30)

    keyword_hits = 0
    question_words = re.findall(r"\w+", question.lower())

    for word in question_words[:10]:
        if word in answer.lower():
            keyword_hits += 1

    technical_score = min(40 + keyword_hits * 5, 90)
    communication_score = 50 + (10 if word_count > 25 else 0)
    depth_score = technical_score - 5

    overall = int((technical_score + communication_score + depth_score) / 3)

    strengths = []
    weaknesses = []
    tips = []

    if keyword_hits > 3:
        strengths.append("Covered key concepts from the question.")

    if word_count > 40:
        strengths.append("Provided detailed explanation.")

    if keyword_hits <= 2:
        weaknesses.append("Missed important technical keywords.")

    if word_count < 15:
        weaknesses.append("Answer too short and lacks depth.")

    if technical_score < 60:
        tips.append("Revise core concepts and provide structured explanations.")

    if communication_score < 60:
        tips.append("Improve clarity and reduce filler words.")

    if not tips:
        tips.append("Good performance. Practice deeper real-world examples.")

    verdict = "Average performance with scope for improvement."
    if overall > 75:
        verdict = "Strong answer with good technical depth."
    elif overall < 50:
        verdict = "Below average. Needs serious technical preparation."

    return {
        "overall_score": overall,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "depth_score": depth_score,
        "subject": subject,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_tips": tips,
        "verdict": verdict
    }
