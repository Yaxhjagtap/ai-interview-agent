import os
import uuid
import tempfile

import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-IN-PrabhatNeural" 
    # Neural voices sound most realistic at their native, unmodified training state.
    rate: str = "+0%"      
    pitch: str = "+0Hz"    
    volume: str = "+0%"

@router.post("/tts")
async def synthesize_tts(payload: TTSRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    tmp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4().hex}.mp3")

    try:
        communicate = edge_tts.Communicate(
            text=text,
            voice=payload.voice,
            rate=payload.rate,
            pitch=payload.pitch,
            volume=payload.volume,
        )
        await communicate.save(tmp_path)

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        return Response(content=audio_bytes, media_type="audio/mpeg")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)