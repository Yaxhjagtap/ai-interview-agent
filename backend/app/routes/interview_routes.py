from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal

from .. import crud, models, schemas, utils

from ..routes.user_routes import get_current_user, get_db

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/start", response_model=schemas.StartInterviewResp)
def start_interview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # require resume
    if not current_user.resume_path:
        raise HTTPException(status_code=400, detail="Upload resume first")
    # extract & parse
    text = utils.extract_text_from_pdf(current_user.resume_path)
    parsed = utils.parse_resume_text(text)
    questions = utils.generate_questions_from_parsed(parsed, max_questions=12)
    # create interview record
    interview = models.Interview(user_id=current_user.id)
    interview.set_questions(questions)
    interview.set_answers([])  # empty list initially
    created = crud.create_interview(db, interview)
    first_q = questions[0] if len(questions) else None
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
        "created_at": interview.created_at
    }

@router.post("/{interview_id}/answer", response_model=schemas.SimpleScore)
def submit_answer(interview_id: int, payload: schemas.AnswerPayload, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    questions = interview.get_questions()
    if payload.question_index < 0 or payload.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")
    qtext = questions[payload.question_index]
    # expected keywords: simple split of question to words (could do smarter mapping)
    expected = re.findall(r"\w+", qtext)[:8] if qtext else []
    # score — now pass transcript_meta for additional metrics
    score = utils.score_answer_text(payload.answer, expected_keywords=[w for w in expected], transcript_meta=payload.transcript_meta)
    # append to answers list
    answers = interview.get_answers()
    answers.append({
        "question_index": payload.question_index,
        "question": qtext,
        "answer": payload.answer,
        "score": score,
        "transcript_meta": payload.transcript_meta
    })
    interview.set_answers(answers)
    crud.save_interview(db, interview)
    return {
        "score": score["score"],
        "technical": score["technical"],
        "communication": score["communication"],
        "details": score
    }


import re
@router.post("/{interview_id}/finish")
def finish_interview(interview_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    answers = interview.get_answers()
    if not answers:
        raise HTTPException(status_code=400, detail="No answers submitted")
    # aggregate
    total_scores = [a["score"]["score"] if isinstance(a["score"], dict) else a.get("score",0) for a in answers]
    avg_score = sum(total_scores) // len(total_scores)
    # breakdown: average technical and comm
    technicals = [a["score"]["technical"] if isinstance(a["score"], dict) else a.get("technical",0) for a in answers]
    comms = [a["score"]["communication"] if isinstance(a["score"], dict) else a.get("communication",0) for a in answers]
    analysis = {
        "overall_score": int(avg_score),
        "by_category": {
            "technical_avg": int(sum(technicals)/len(technicals)),
            "communication_avg": int(sum(comms)/len(comms))
        },
        "tips": []
    }
    # simple tips generation
    if analysis["by_category"]["technical_avg"] < 40:
        analysis["tips"].append("Review core data structures and algorithms and practise explaining project internals.")
    if analysis["by_category"]["communication_avg"] < 15:
        analysis["tips"].append("Work on concise answers and reduce filler words. Practice mock interviews.")
    if not analysis["tips"]:
        analysis["tips"].append("Good job — keep practicing to improve further.")
    # save analysis
    interview.set_analysis(analysis)
    crud.save_interview(db, interview)
    return analysis

@router.get("/")
def list_interviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = crud.list_user_interviews(db, current_user.id)
    return [{
        "id": i.id,
        "created_at": i.created_at,
        "questions_count": len(i.get_questions()),
        "answers_count": len(i.get_answers()),
        "analysis": i.get_analysis()
    } for i in items]
    
    
