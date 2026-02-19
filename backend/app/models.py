# SQLAlchemy models
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import json

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    education = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # comma separated (fallback)
    company_interest = Column(String, nullable=True)
    resume_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    questions_json = Column(Text, nullable=True)   # JSON list of questions
    answers_json = Column(Text, nullable=True)     # JSON list of {question_index, answer, score, meta}
    analysis_json = Column(Text, nullable=True)    # final analysis JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")

    def set_questions(self, questions):
        self.questions_json = json.dumps(questions)

    def get_questions(self):
        import json
        return json.loads(self.questions_json or "[]")

    def set_answers(self, answers):
        self.answers_json = json.dumps(answers)

    def get_answers(self):
        import json
        return json.loads(self.answers_json or "[]")

    def set_analysis(self, obj):
        import json
        self.analysis_json = json.dumps(obj)

    def get_analysis(self):
        import json
        return json.loads(self.analysis_json or "{}")
    
