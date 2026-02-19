from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import crud, models, schemas, auth

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=dict)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    new = models.User(
        name=user_in.name,
        email=user_in.email,
        password=auth.hash_password(user_in.password),
        education=user_in.education,
        address=user_in.address,
        skills=user_in.skills,
        company_interest=user_in.company_interest
    )
    created = crud.create_user(db, new)
    return {"message": "registered", "user_id": created.id}

@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, data.email)
    if not user or not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}
