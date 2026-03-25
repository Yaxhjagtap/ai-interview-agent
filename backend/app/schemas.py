# app/schemas.py
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional, Any
from enum import Enum

# ============================================================================
# USER SCHEMAS
# ============================================================================

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
    education: Optional[str] = None
    address: Optional[str] = None
    skills: Optional[str] = None
    company_interest: Optional[str] = None
    resume_path: Optional[str] = None

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

# ============================================================================
# INTERVIEW SCHEMAS
# ============================================================================

class InterviewType(str, Enum):
    RESUME = "resume"
    COMPANY = "company"
    ROLE = "role"

class StartInterviewRequest(BaseModel):
    interview_type: str = "resume"
    company: Optional[str] = None
    role: Optional[str] = None
    experience: Optional[str] = None

    @validator('interview_type')
    def validate_interview_type(cls, v):
        if v is None:
            return "resume"
        v = str(v).lower().strip()
        allowed = {"resume", "company", "role"}
        if v not in allowed:
            raise ValueError(f"interview_type must be one of {allowed}, got '{v}'")
        return v

    # Remove 'pre=True' from these validators or ensure they handle None
    @validator('company', 'role', 'experience')
    def clean_strings(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    class Config:
        extra = "ignore"
class StartInterviewResp(BaseModel):
    interview_id: int
    first_question: Optional[str] = None
    total_questions: Optional[int] = None

class AnswerPayload(BaseModel):
    question_index: int
    answer: str
    transcript_meta: Optional[Any] = None

class SimpleScore(BaseModel):
    score: int
    technical: int
    communication: int
    details: Optional[Any] = None