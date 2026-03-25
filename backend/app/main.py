from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .database import engine
from . import models
from .routes import auth_routes, user_routes, interview_routes, transcribe_routes, tts as tts_routes

# ensure DB tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeepSeek Interview Backend")

# ----------------- REQUEST LOGGING MIDDLEWARE -----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n{'='*60}")
    print(f"INCOMING REQUEST: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")

    body = b""
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.body()
            print(f"Body bytes: {len(body)}")
            print(f"Body text: {body.decode(errors='ignore') if body else 'EMPTY'}")
        except Exception as e:
            print(f"Error reading body: {e}")

    print(f"{'='*60}\n")

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request = Request(request.scope, receive)
    response = await call_next(request)
    return response

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# include routers
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(interview_routes.router)
app.include_router(transcribe_routes.router)
app.include_router(tts_routes.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "DeepSeek interview backend running. Open /docs for API."}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"\n{'='*60}")
    print(f"VALIDATION ERROR: {exc.errors()}")
    print(f"BODY: {exc.body}")
    print(f"{'='*60}\n")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body,
            "message": "Validation failed - check your request format"
        }
    )