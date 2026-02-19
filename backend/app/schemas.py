# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    education: Optional[str] = None
    address: Optional[str] = None
    skills: Optional[str] = None
    company_interest: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    education: Optional[str]
    address: Optional[str]
    skills: Optional[str]
    company_interest: Optional[str]
    resume_path: Optional[str]

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UploadResponse(BaseModel):
    uploaded: bool
    resume_path: Optional[str] = None

class StartInterviewResp(BaseModel):
    interview_id: int
    first_question: Optional[str] = None

class AnswerPayload(BaseModel):
    question_index: int
    answer: str
    transcript_meta: Optional[Any] = None

class SimpleScore(BaseModel):
    score: int
    technical: int
    communication: int
    details: Optional[Any] = None
