# backend/app/utils.py
import re
import math
import difflib
from typing import List, Dict, Optional
from PyPDF2 import PdfReader
from collections import Counter

# small constants and helpers
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

FILLER_WORDS = {"um", "uh", "hmm", "like", "you know", "so", "actually", "basically", "right", "okay"}
TECH_TERMS = [
    "algorithm", "complexity", "big o", "optimization", "optimize", "scale", "scalability",
    "latency", "throughput", "index", "sql", "normaliz", "thread", "deadlock", "concurrency",
    "asynchronous", "hash", "queue", "stack", "graph", "tree", "database", "cache", "redis",
    "docker", "kubernetes", "api", "endpoint", "http", "tcp", "udp", "encryption", "oauth",
]

def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    text_parts = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text_parts.append(t)
    return "\n".join(text_parts)

def parse_resume_text(text: str) -> Dict:
    """
    Very simple heuristic parser that extracts skills, projects, and keywords.
    """
    text = text or ""
    skills = []
    projects = []
    m = re.search(r"(skills|technical skills|skillset)\s*[:\-]\s*(.+?)(?:\n\n|\n[A-Z]|\Z)", text, re.I | re.S)
    if m:
        raw = m.group(2)
        skills = [s.strip() for s in re.split(r",|\n|•|·|-", raw) if s.strip()]

    # projects: lines containing 'project'
    for line in text.splitlines():
        if re.search(r"\bproject\b[:\s\-]?", line, re.I):
            projects.append(line.strip())

    # fallback minimal projects extraction
    if not projects:
        for line in text.splitlines():
            if 5 < len(line) < 200 and "project" in line.lower():
                projects.append(line.strip())

    # keywords from skills and whole text
    keywords = set()
    for s in skills:
        for token in re.split(r"[\s/,+\-]+", s):
            if len(token) > 1:
                keywords.add(token.lower())

    # add top frequent tokens from resume body (safe heuristics)
    tokens = re.findall(r"\w+", text.lower())
    freq = Counter(tokens)
    # exclude stop short words
    for w, _ in freq.most_common(40):
        if len(w) > 3 and not re.match(r"^\d+$", w):
            keywords.add(w)

    return {"skills": skills, "projects": projects, "keywords": list(sorted(keywords)), "raw": text[:20000]}

def generate_questions_from_parsed(parsed: Dict, max_questions: int = 12) -> List[str]:
    questions = []
    for proj in parsed.get("projects", [])[:4]:
        q = f"Tell me about this project: {proj[:200]}. What was your role and the key technical challenges?"
        questions.append(q)
        q2 = f"For that project, how did you design the core module and how did you test it?"
        questions.append(q2)
    for s in parsed.get("skills", [])[:6]:
        questions.append(f"You listed '{s}'. Explain an important technical concept related to {s}.")
    for kw in parsed.get("keywords", [])[:4]:
        questions.append(f"Quick question: explain {kw} in brief.")
    for topic in ["OOP", "DBMS", "OS", "CN"]:
        questions.extend(COMMON_QUESTIONS.get(topic, [])[:2])
    return questions[:max_questions]


def _tokenize(text: str) -> List[str]:
    return re.findall(r"\w+", (text or "").lower())


def _keyword_match_score(expected: List[str], text_tokens: List[str]) -> float:
    if not expected:
        return 0.0
    expected_norm = [e.lower() for e in expected if len(e.strip()) > 0]
    matches = 0
    for e in expected_norm:
        # exact token check or substring check
        e_toks = re.findall(r"\w+", e)
        if any((t == e) for t in text_tokens for e in e_toks):
            matches += 1
        elif any(e in t for t in text_tokens):
            matches += 1
    return matches / max(1, len(expected_norm))


def _similarity_ratio(a: str, b: str) -> float:
    try:
        return difflib.SequenceMatcher(None, a, b).ratio()
    except Exception:
        return 0.0


def score_answer_text(answer: str,
                      expected_keywords: Optional[List[str]] = None,
                      transcript_meta: Optional[Dict] = None,
                      resume_keywords: Optional[List[str]] = None) -> Dict:
    """
    Returns a rich scoring object. Designed to be deterministic and interpretable.
    - expected_keywords: keywords derived from the question (short list)
    - transcript_meta: may contain "duration" (seconds) and "segments" list returned by your STT
    - resume_keywords: list of tokens extracted from resume (helps resume_match)
    """
    expected_keywords = expected_keywords or []
    resume_keywords = resume_keywords or []
    a = (answer or "").strip()
    text_lower = a.lower()
    tokens = _tokenize(a)
    word_count = len(tokens)
    sentence_count = len([s for s in re.split(r"[.!?]+", a) if s.strip()])
    unique_words = len(set(tokens))
    lexical_diversity = (unique_words / word_count) if word_count > 0 else 0.0
    filler_count = sum(text_lower.count(f) for f in FILLER_WORDS)

    # keyword match ratio against question expected keywords (0..1)
    kw_ratio = _keyword_match_score(expected_keywords, tokens)

    # resume match: fraction of resume keywords present in answer
    res_ratio = 0.0
    if resume_keywords:
        rw = [r.lower() for r in resume_keywords if len(r.strip()) > 1]
        if rw:
            present = sum(1 for r in rw if any(r in t for t in tokens))
            res_ratio = present / max(1, len(rw))
    else:
        # fallback: similarity of answer to expected keywords joined
        if expected_keywords:
            joined = " ".join(expected_keywords).lower()
            res_ratio = _similarity_ratio(joined, text_lower)

    # detect technical term presence (counts)
    tech_hits = 0
    for t in TECH_TERMS:
        if t in text_lower:
            tech_hits += 1

    # heuristics for depth / technical richness
    depth_score = min(100, int((kw_ratio * 60) + (tech_hits * 5) + (min(1, lexical_diversity) * 20)))

    # technical score (0..100)
    technical_score = min(100, int((kw_ratio * 70) + (tech_hits * 7) + (depth_score * 0.1)))

    # communication score (0..100) using pacing, lexical_diversity, filler words
    wpm = None
    duration = None
    if transcript_meta and isinstance(transcript_meta, dict):
        duration = float(transcript_meta.get("duration", 0) or 0)
        if duration > 0:
            wpm = int((word_count / duration) * 60)
    # baseline communication: lexical + sentence structure
    comm_base = min(100, int(lexical_diversity * 100 * 0.6 + min(1, sentence_count/3) * 40))
    # penalize filler words
    comm_penalty = min(30, filler_count * 4)
    comm_score = max(0, comm_base - comm_penalty)
    # small boost for reasonable speaking rate
    if wpm:
        if 100 <= wpm <= 200:
            comm_score = min(100, comm_score + 8)
        elif wpm > 240:
            comm_score = max(0, comm_score - 8)

    # resume match 0..100
    resume_match = int(min(100, res_ratio * 100))

    # resume bonus (0..10)
    resume_bonus = min(10, int(resume_match / 10))

    # overall weighted score
    overall = int(round(0.6 * technical_score + 0.3 * comm_score + 0.1 * resume_match))
    overall = max(0, min(100, overall))

    # strengths / weaknesses heuristics
    strengths = []
    weaknesses = []
    tips = []

    if technical_score > 65:
        strengths.append("Good technical coverage")
    if depth_score > 60:
        strengths.append("Shows conceptual depth")
    if comm_score > 60:
        strengths.append("Clear communicator")

    if technical_score < 40:
        weaknesses.append("Weak technical details — expand on steps and algorithms")
        tips.append("Describe the design choices and algorithmic complexity (Big-O).")
    if resume_match < 30:
        weaknesses.append("Answer doesn't reference resume or project specifics")
        tips.append("Link your answer to specific project tasks, numbers, or modules from your resume.")
    if comm_score < 30:
        weaknesses.append("Clarity and pacing issues")
        tips.append("Speak slower, organize answers: Problem → Approach → Result.")

    # final structured response
    result = {
        "overall_score": overall,
        "technical": int(technical_score),
        "communication": int(comm_score),
        "depth": int(depth_score),
        "resume_match": int(resume_match),
        "resume_bonus": int(resume_bonus),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "tips": tips,
        "speech_meta": {
            "duration": duration,
            "wpm": wpm,
            "filler_count": filler_count,
            "word_count": word_count,
            "lexical_diversity": round(lexical_diversity, 3),
            "sentence_count": sentence_count
        },
        "meta": {
            "keyword_ratio": round(kw_ratio, 3),
            "tech_hits": tech_hits
        }
    }

    # console debug — useful while developing
    print("---- scoring debug ----")
    print("answer (short):", (a[:240] + ("..." if len(a) > 240 else "")))
    print("word_count:", word_count, "sentences:", sentence_count, "lexdiv:", round(lexical_diversity, 3))
    print("expected_keywords:", expected_keywords)
    print("kw_ratio:", round(kw_ratio, 3), "tech_hits:", tech_hits, "resume_match:", resume_match)
    print("technical_score:", technical_score, "comm_score:", comm_score, "depth:", depth_score, "overall:", overall)
    print("strengths:", strengths, "weaknesses:", weaknesses, "tips:", tips)
    print("-----------------------")

    return result
