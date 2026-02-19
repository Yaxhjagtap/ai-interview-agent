# small helper CRUD functions
from sqlalchemy.orm import Session
from . import models

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).get(user_id)

def create_user(db: Session, user_obj: models.User):
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

def update_user(db: Session, user: models.User, data: dict):
    for k, v in data.items():
        if hasattr(user, k) and v is not None:
            setattr(user, k, v)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_interview(db: Session, interview: models.Interview):
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview

def get_interview(db: Session, interview_id: int):
    return db.query(models.Interview).get(interview_id)

def list_user_interviews(db: Session, user_id: int):
    return db.query(models.Interview).filter(models.Interview.user_id == user_id).order_by(models.Interview.created_at.desc()).all()

def save_interview(db: Session, interview: models.Interview):
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview
