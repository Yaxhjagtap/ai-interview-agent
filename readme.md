<div align="center">

# 🎙️ DeepSeek — AI Interview Agent

### Full-Stack AI-Powered Mock Interview Platform for Engineering Students

[![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

*Upload your resume → Talk to a 3D AI interviewer → Get instant, structured feedback*

</div>

---

## 📌 Overview

**DeepSeek** is an end-to-end AI interview simulation platform built for engineering students to practice technical interviews in a realistic, spoken-conversation format. Students upload their resume, interact with a **3D animated avatar** through voice, and receive **structured feedback** across technical accuracy, communication skills, and depth of knowledge — all powered by a modern, locally-runnable AI pipeline.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 **Resume Upload** | Parses and analyzes student resumes to personalize interview questions |
| 🧑‍💻 **3D Avatar Interviewer** | Immersive, animated interview experience via `@react-three/fiber` |
| 🎤 **Speech-to-Text** | Real-time, local transcription powered by `faster-whisper` |
| 🔊 **Text-to-Speech** | Natural avatar voice via browser `speechSynthesis` or `HeadTTS` |
| 🧠 **AI Scoring Engine** | Heuristic scoring today, pluggable with local LLMs (Teuken / WizardLM / Apertus) |
| 📊 **Structured Feedback** | Breakdown across technical, communication, and depth metrics |
| 🐳 **Docker-Ready** | Easily containerized for consistent dev & prod environments |

---

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), `@react-three/fiber` for 3D rendering |
| **Backend** | FastAPI, SQLAlchemy |
| **Speech-to-Text** | `faster-whisper` (runs locally) |
| **Text-to-Speech** | Browser `speechSynthesis` / HeadTTS |
| **LLM Scoring** | Heuristic engine (local LLM support: Teuken, WizardLM, Apertus) |
| **Database** | SQLite (development) → PostgreSQL (production) |
| **Containerization** | Docker |

</div>

---

## 🚀 Quick Start (Development)

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1     # Windows (PowerShell)
# source .venv/bin/activate    # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will start at `http://127.0.0.1:8000`

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`

---

## 📂 Project Structure

```
deepseek-ai-interview-agent/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── ...
│   ├── requirements.txt
│   └── .venv/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🧭 Roadmap

- [ ] Plug in local LLM (Teuken / WizardLM / Apertus) for advanced scoring
- [ ] PostgreSQL production deployment
- [ ] Full Docker Compose setup (frontend + backend + DB)
- [ ] Multi-language interview support
- [ ] Interview history & progress dashboard

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](../../issues) or submit a pull request.

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use and modify it.

---

<div align="center">

**Built with ❤️ for engineering students preparing for their dream interviews**

</div>