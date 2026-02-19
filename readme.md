# DeepSeek — AI Interview Agent

**What it is**
A full-stack AI-powered mock interview platform for engineering students. Students upload resumes, take spoken interviews with a 3D avatar, and receive structured feedback (technical, communication, depth).

**Tech stack**
- Frontend: React (Vite), @react-three/fiber (3D avatar)
- Backend: FastAPI, SQLAlchemy
- STT: faster-whisper (local)
- TTS: Browser `speechSynthesis` or HeadTTS (browser)
- LLM scoring: Heuristic now; ready to plug local LLM (Teuken / WizardLM / Apertus)
- DB: SQLite (dev), PostgreSQL (prod-ready)
- Containerization: Docker (recommended)

**Quick start (dev)**
```bash
# backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # powershell
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
