# backend/app/routes/transcribe_routes.py
import os
import time
import tempfile
import shutil
import re
import logging
from typing import Dict, Any

from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="", tags=["transcribe"])

# ============================================================================
# Configuration (can be overridden via environment variables)
# ============================================================================
# Model choice: "small" (multilingual) or "small.en" (English-only)
# For Indian English, "small" often works better, but you can try both.
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")   # multilingual

# GPU usage
WHISPER_USE_GPU = os.getenv("WHISPER_USE_GPU", "false").lower() in ("1", "true", "yes")

# Cache directory for model files
MODEL_CACHE_DIR = os.getenv("WHISPER_MODEL_CACHE", os.path.join(os.getcwd(), "whisper_model_cache"))

# Transcription parameters
BEAM_SIZE = int(os.getenv("WHISPER_BEAM_SIZE", "3"))           # default 3
VAD_SILENCE_MS = int(os.getenv("WHISPER_VAD_SILENCE_MS", "500"))  # 500 ms silence to consider a pause
VAD_THRESHOLD = float(os.getenv("WHISPER_VAD_THRESHOLD", "0.5"))   # VAD sensitivity
VAD_SPEECH_MS = int(os.getenv("WHISPER_VAD_SPEECH_MS", "250"))     # min speech duration

# Enable/disable post-processing
POSTPROCESS = os.getenv("WHISPER_POSTPROCESS", "true").lower() in ("1", "true", "yes")
# ============================================================================

_whisper_model = None

def _load_whisper_model():
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model

    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        raise RuntimeError(
            "faster-whisper library not available. Install with `pip install faster-whisper` "
            "and ensure `ffmpeg` is installed on your system."
        ) from e

    try:
        device = "cuda" if WHISPER_USE_GPU else "cpu"
        compute_type = "float16" if WHISPER_USE_GPU else "int8"
        
        logger.info(f"Loading model '{WHISPER_MODEL}' (device={device}, compute={compute_type})...")
        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        
        model = WhisperModel(
            WHISPER_MODEL, 
            device=device, 
            compute_type=compute_type,
            download_root=MODEL_CACHE_DIR
        )
        _whisper_model = model
        logger.info(f"Model '{WHISPER_MODEL}' loaded successfully")
        return _whisper_model
    except Exception as e:
        raise RuntimeError(f"Failed to load whisper model '{WHISPER_MODEL}': {e}") from e

def _auto_format_transcript(text: str) -> str:
    """Lightweight text formatter to clean up transcriptions."""
    if not text:
        return ""
    # Remove extra spaces
    formatted = re.sub(r'\s+', ' ', text.strip())
    # Capitalize first letter
    if formatted:
        formatted = formatted[0].upper() + formatted[1:]
    return formatted

def _postprocess_indian_english(text: str) -> str:
    """
    Optional post‑processing to correct common Indian English mis‑transcriptions.
    Disabled by default – enable via env variable.
    """
    if not POSTPROCESS:
        return text
    
    # Add/remove rules as needed
    corrections = [
        (r'\b(?:fifty|fifity)\b', 'fifteen'),   # careful – may be genuine
        (r'\bdaata\b', 'data'),
        (r'\bvar\b', 'war'),
    ]
    for pattern, repl in corrections:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    return text

# Enhanced initial prompt – shorter to avoid overwhelming the model
INDIAN_PROMPT = (
    "I am an Indian software developer. I speak English with an Indian accent. "
    "I use words like 'actually', 'basically', 'you see', 'I mean', 'like', "
    "'kind of', 'sort of', 'you know', 'right', 'no', 'na'. "
    "I talk about React, Python, Django, MongoDB, and technical interviews."
)

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
        logger.debug(f"Saved uploaded file to {tmp_path}")
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    start_time = time.time()

    try:
        model = _load_whisper_model()
    except RuntimeError as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.error(f"Model loading failed: {e}")
        raise HTTPException(status_code=501, detail=str(e))

    try:
        segments_gen, info = model.transcribe(
            tmp_path,
            beam_size=BEAM_SIZE,
            language="en",
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=VAD_SILENCE_MS,
                threshold=VAD_THRESHOLD,
                min_speech_duration_ms=VAD_SPEECH_MS,
            ),
            initial_prompt=INDIAN_PROMPT
        )
        
        segments = []
        full_text = []
        
        for segment in segments_gen:
            full_text.append(segment.text)
            segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip()
            })
            
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    raw_text = " ".join(full_text)
    clean_text = _auto_format_transcript(raw_text)
    clean_text = _postprocess_indian_english(clean_text)
    
    duration = info.duration if hasattr(info, 'duration') else 0.0
    elapsed = time.time() - start_time

    # Clean up
    try:
        shutil.rmtree(tmp_dir, ignore_errors=True)
    except Exception:
        pass

    resp = {
        "text": clean_text,
        "segments": segments,
        "model": WHISPER_MODEL,
        "duration": duration,
        "elapsed": round(elapsed, 3),
    }

    logger.info(f"Transcription completed in {elapsed:.2f}s, duration {duration:.2f}s")
    return JSONResponse(status_code=200, content=resp)