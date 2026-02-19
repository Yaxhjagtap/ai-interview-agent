def build_evaluation_prompt(resume_text, question, answer, subject, company):
    return f"""
You are a strict technical interviewer.

Candidate Target Company: {company}
Subject Area: {subject}

Resume:
{resume_text[:3000]}

Question:
{question}

Candidate Answer:
{answer}

Evaluate the candidate realistically and strictly.

Return ONLY valid JSON in this exact format:

{{
  "overall_score": int,
  "technical_score": int,
  "communication_score": int,
  "depth_score": int,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvement_tips": ["string"],
  "verdict": "short paragraph"
}}

Scoring rules:
- Be realistic.
- Penalize incorrect or vague answers.
- Reward depth and clarity.
- Consider resume alignment.
"""
