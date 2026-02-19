# backend/app/routes/transcribe_routes.py
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import crud
from ..config import SECRET_KEY, ALGORITHM, UPLOAD_DIR
from jose import jwt, JWTError

# faster-whisper import
from faster_whisper import WhisperModel

router = APIRouter(prefix="/transcribe", tags=["transcribe"])

# ----------------- simple auth -----------------
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    cred_exc = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise cred_exc
    except JWTError:
        raise cred_exc
    user = crud.get_user(db, user_id)
    if not user:
        raise cred_exc
    return user

# ----------------- model loader (singleton) -----------------
_MODEL = None
_MODEL_NAME = os.environ.get("FW_MODEL", "small")  # change to tiny/base/small as desired

def get_model():
    global _MODEL
    if _MODEL is None:
        # pick device/compute based on installed torch/cuda
        device = "cpu"
        compute_type = None
        try:
            import torch
            if torch.cuda.is_available():
                device = "cuda"
                compute_type = "float16"
            else:
                device = "cpu"
                compute_type = "int8"
        except Exception:
            device = "cpu"
            compute_type = "int8"
        # instantiate model
        _MODEL = WhisperModel(_MODEL_NAME, device=device, compute_type=compute_type)
    return _MODEL

# ----------------- helper to save uploaded file -----------------
def _save_upload_file(upload_file: UploadFile) -> str:
    ext = os.path.splitext(upload_file.filename)[1]
    fn = f"{uuid.uuid4().hex}{ext}"
    out_path = os.path.join(UPLOAD_DIR, fn)
    with open(out_path, "wb") as f:
        f.write(upload_file.file.read())
    return out_path

# ----------------- transcription endpoint -----------------
@router.post("/", summary="Upload audio (wav/mp3/webm) and return transcription")
async def transcribe_audio(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    # validate file type
    allowed = (".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac")
    filename = file.filename or ""
    if not any(filename.lower().endswith(x) for x in allowed):
        raise HTTPException(status_code=400, detail="Audio file required (.wav/.mp3/.m4a/.ogg/.webm/.flac)")

    # save file
    try:
        path = _save_upload_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    try:
        model = get_model()
        # transcribe: returns generator of segments and info
        segments, info = model.transcribe(path, beam_size=5)
        text = " ".join([seg.text.strip() for seg in segments if seg.text])
        # optionally return timestamps for each segment
        segments_out = [{"start": float(seg.start), "end": float(seg.end), "text": seg.text} for seg in segments]
        result = {"text": text, "segments": segments_out, "model": _MODEL_NAME, "duration": float(info.duration)}
    except Exception as e:
        # keep a helpful message but not leak internals
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
    finally:
        try:
            os.remove(path)
        except Exception:
            pass

    return JSONResponse(result)
