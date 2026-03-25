import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// Shared state for the 3D avatar
export const audioState = {
  analyser: null,
  dataArray: null,
  isWebSpeech: false,
  targetMouth: 0,   // driven by voiceService viseme engine (0..1)
};

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// --- AUTH ---
export async function register(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function login(payload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload) 
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// --- USERS ---
export async function getProfile() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch profile");
  }
  return res.json();
}

export async function updateProfile(payload) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function uploadResume(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/users/me/upload_resume`, {
    method: "POST",
    headers: { ...getAuthHeaders() }, 
    body: fd
  });
  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
}

// --- INTERVIEWS ---
// --- INTERVIEWS ---
export async function startInterview(payload = {}) {
  const res = await fetch(`${API_BASE}/interviews/start`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      ...getAuthHeaders() 
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    
    let errorMsg = "Failed to start interview";
    try {
      const errData = await res.json();
      errorMsg = Array.isArray(errData.detail) 
        ? JSON.stringify(errData.detail) 
        : (errData.detail || errorMsg);
    } catch (e) {
      const text = await res.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

export async function listInterviews() {
  const res = await fetch(`${API_BASE}/interviews/`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch interviews");
  return res.json();
}

export async function getInterview(id) {
  const res = await fetch(`${API_BASE}/interviews/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch interview");
  return res.json();
}

export async function submitAnswer(interview_id, payload) {
  const res = await fetch(`${API_BASE}/interviews/${interview_id}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Submit failed");
  return res.json();
}

export async function finishInterview(interview_id) {
  const res = await fetch(`${API_BASE}/interviews/${interview_id}/finish`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to finish interview");
  return res.json();
}

// --- TRANSCRIBE ---
export async function transcribeUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/transcribe/`, {
    method: "POST",
    headers: { ...getAuthHeaders() }, 
    body: fd
  });
  if (!res.ok) throw new Error("Failed to transcribe audio");
  return res.json(); 
}

// --- SPEAK (Web Speech only) ---
export async function speak(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Helper to create and speak the utterance once voices are ready
  const speakUtterance = () => {
    const voices = window.speechSynthesis.getVoices();
    let selected = null;

    // Prefer male voices
    const preferred = [
      "Google UK Male",
      "Alex",
      "Daniel",
      "David",
      "Google US English",
      "Microsoft David Desktop"
    ];
    for (const p of preferred) {
      const v = voices.find(x => x.name && x.name.toLowerCase().includes(p.toLowerCase()));
      if (v) { selected = v; break; }
    }

    if (!selected) {
      selected = voices.find(v => v.name && /male|man/i.test(v.name)) || voices[0] || null;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selected) utterance.voice = selected;
    utterance.rate = 0.95;
    utterance.pitch = 0.95;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      audioState.isWebSpeech = true;
      // console.log("WebSpeech started");
    };
    utterance.onend = () => {
      audioState.isWebSpeech = false;
      // console.log("WebSpeech ended");
    };

    window.speechSynthesis.speak(utterance);
  };

  // If voices are already loaded, speak immediately.
  if (window.speechSynthesis.getVoices().length > 0) {
    speakUtterance();
  } else {
    // Otherwise wait for the voiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null; // cleanup
      speakUtterance();
    };
  }
}