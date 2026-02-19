KEYWORDS = ["class", "object", "sql", "thread", "network"]


def score_answer(text):

    score = 0

    text = text.lower()

    for k in KEYWORDS:
        if k in text:
            score += 10

    return min(score, 100)
