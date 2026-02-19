# backend/app/routes/transcribe_routes.py
import os
import time
import tempfile
import shutil
from typing import Dict, Any

from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="", tags=["transcribe"])

# Config via env
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny")  # FAST default; change to "small" if you want more accuracy
WHISPER_USE_GPU = os.getenv("WHISPER_USE_GPU", "false").lower() in ("1", "true", "yes")

_whisper_model = None

def _load_whisper_model():
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model

    try:
        import whisper  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "whisper library not available. Install with `pip install openai-whisper` "
            "and ensure `ffmpeg` is installed on your system."
        ) from e

    try:
        print(f"[transcribe] loading whisper model '{WHISPER_MODEL}' (gpu={WHISPER_USE_GPU}) ...")
        model = whisper.load_model(WHISPER_MODEL)
        _whisper_model = model
        print(f"[transcribe] whisper model '{WHISPER_MODEL}' loaded")
        return _whisper_model
    except Exception as e:
        raise RuntimeError(f"Failed to load whisper model '{WHISPER_MODEL}': {e}") from e


@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...), request: Request = None) -> Dict[str, Any]:
    """
    Accepts multipart form file under key "file".
    Returns JSON: { text: str, segments: list, model: str, duration: float, elapsed: float }
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No audio file uploaded.")

    tmp_dir = tempfile.mkdtemp(prefix="transcribe-")
    tmp_path = os.path.join(tmp_dir, file.filename)
    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    start_time = time.time()

    try:
        model = _load_whisper_model()
    except RuntimeError as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=501, detail=str(e))

    try:
        # Force language to English to skip detection (faster)
        # task='transcribe' is default; set verbose False to reduce logs
        result = model.transcribe(tmp_path, language="en", temperature=0.0, verbose=False)
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    text = result.get("text", "").strip()
    segments = result.get("segments", []) or []
    duration = 0.0
    if segments:
        try:
            duration = float(segments[-1].get("end", 0.0))
        except Exception:
            duration = 0.0
    elapsed = time.time() - start_time

    try:
        shutil.rmtree(tmp_dir, ignore_errors=True)
    except Exception:
        pass

    resp = {
        "text": text,
        "segments": segments,
        "model": WHISPER_MODEL,
        "duration": duration,
        "elapsed": round(elapsed, 3),
    }

    return JSONResponse(status_code=200, content=resp)
