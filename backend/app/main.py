# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routes import auth_routes, user_routes, interview_routes, transcribe_routes

# ensure DB tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeepSeek Interview Backend")

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(interview_routes.router)
app.include_router(transcribe_routes.router)

@app.get("/")
def root():
    return {"message": "DeepSeek interview backend running. Open /docs for API."}
