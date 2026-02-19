# utilities: resume parsing, question generation, scoring
from PyPDF2 import PdfReader
import re
from typing import List, Dict
import math

COMMON_QUESTIONS = {
    "OOP": [
        "Explain the four pillars of OOP with short examples.",
        "What is polymorphism? Give a short example.",
        "Explain inheritance vs composition."
    ],
    "DBMS": [
        "What is normalization and why is it important?",
        "Explain ACID properties."
    ],
    "OS": [
        "What is a process vs a thread?",
        "Explain deadlock and how to prevent it."
    ],
    "CN": [
        "Explain the TCP three-way handshake.",
        "What is latency vs bandwidth?"
    ]
}

FILLER_WORDS = {"um","uh","hmm","like","you know","so","actually","basically"}

def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    text_parts = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text_parts.append(t)
    return "\n".join(text_parts)

def parse_resume_text(text: str) -> Dict:
    # Very simple heuristics for zero-cost parser
    skills = []
    projects = []
    # Look for "skills" section
    m = re.search(r"(skills|technical skills|skillset)\s*[:\-]\s*(.+?)(?:\n\n|\n[A-Z]|\Z)", text, re.I | re.S)
    if m:
        raw = m.group(2)
        # split by comma or newline or bullet
        skills = [s.strip() for s in re.split(r",|\n|•|·|-", raw) if s.strip()]
    # Projects - lines containing 'project' or 'project:' or capitalized 'Project'
    for line in text.splitlines():
        if re.search(r"\bproject\b[:\s\-]?", line, re.I):
            projects.append(line.strip())
    # fallback: find lines that look like "Project - Title: description"
    if not projects:
        for i, line in enumerate(text.splitlines()):
            if len(line) < 200 and "project" in line.lower():
                projects.append(line.strip())
    # also pick up some keywords (for technical question generation)
    keywords = set()
    for s in skills:
        for token in re.split(r"[\s/,+\-]+", s):
            if len(token) > 1:
                keywords.add(token.lower())
    return {"skills": skills, "projects": projects, "keywords": list(keywords), "raw": text[:10000]}

def generate_questions_from_parsed(parsed: Dict, max_questions: int = 12) -> List[str]:
    questions = []
    # Project-based questions
    for proj in parsed.get("projects", [])[:4]:
        q = f"Tell me about this project: {proj[:200]}. What was your role and the key technical challenges?"
        questions.append(q)
        q2 = f"For that project, how did you design the core module and how did you test it?"
        questions.append(q2)
    # Skill-based questions
    for s in parsed.get("skills", [])[:6]:
        questions.append(f"You listed '{s}'. Explain an important technical concept related to {s}.")
    # keyword-based quick checks
    for kw in parsed.get("keywords", [])[:4]:
        questions.append(f"Quick question: explain {kw} in brief.")
    # add common topics
    for topic in ["OOP", "DBMS", "OS", "CN"]:
        questions.extend(COMMON_QUESTIONS.get(topic, [])[:2])
    # trim and return
    questions = questions[:max_questions]
    return questions

def score_answer_text(answer: str, expected_keywords: List[str] = None, transcript_meta: Dict = None) -> Dict:
    expected_keywords = expected_keywords or []
    a = answer or ""
    text = a.lower()

    # technical score (0-60)
    tech_points = 0
    for kw in expected_keywords:
        if kw.lower() in text:
            tech_points += 1
    tech_score = min(60, int((tech_points / max(1, len(expected_keywords))) * 60)) if expected_keywords else 0

    # communication score (0-30) using text heuristics
    words = re.findall(r"\w+", text)
    word_count = max(0, len(words))
    filler_count = sum(text.count(f) for f in FILLER_WORDS)
    comm_score = int(max(0, min(30, (min(300, word_count) / 300) * 30 - filler_count)))
    sentences = re.split(r"[.!?]+", text)
    sent_count = len([s for s in sentences if s.strip()])
    if sent_count >= 2 and word_count > 10:
        comm_score = min(30, comm_score + 2)

    # resume knowledge bonus (0-10)
    resume_bonus = 0
    for kw in expected_keywords[:5]:
        if kw.lower() in text:
            resume_bonus += 2
    resume_bonus = min(10, resume_bonus)

    # Speech-derived metrics (if transcript_meta provided)
    speech_meta = {}
    if transcript_meta:
        duration = float(transcript_meta.get("duration", 0))  # seconds
        # compute words-per-minute
        wpm = 0
        if duration > 0:
            wpm = int((word_count / duration) * 60)
        # filler_count already counted from text, but if segments exist we could refine
        speech_meta = {"duration": duration, "wpm": wpm, "filler_count": filler_count, "word_count": word_count}

        # add small communication boost for reasonable speaking rate (100-180 wpm typical)
        if 80 <= wpm <= 200:
            comm_score = min(30, comm_score + 3)
        elif wpm > 220:  # too fast
            comm_score = max(0, comm_score - 3)
    else:
        speech_meta = {"duration": None, "wpm": None, "filler_count": filler_count, "word_count": word_count}

    total = tech_score + comm_score + resume_bonus
    total = int(max(0, min(100, total)))

    return {
        "score": total,
        "technical": int(tech_score),
        "communication": int(comm_score),
        "resume_bonus": resume_bonus,
        "speech_meta": speech_meta,
        "meta": {
            "word_count": word_count,
            "filler_count": filler_count,
            "sentences": sent_count
        }
    }

