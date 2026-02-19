const API_BASE = "http://127.0.0.1:8000";

function getAuthHeaders(){
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function register(payload){
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function login(payload){
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getProfile(){
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { ...getAuthHeaders() }
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch profile");
  }
  return res.json();
}

export async function updateProfile(payload){
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: { "Content-Type":"application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to update profile");
  }
  return res.json();
}

export async function uploadResume(file){
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/users/me/upload_resume`, {
    method: "POST",
    headers: { ...getAuthHeaders() }, // DO NOT set Content-Type for formdata
    body: fd
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to upload resume");
  }
  return res.json();
}

export async function startInterview(){
  const res = await fetch(`${API_BASE}/interviews/start`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    const txt = await res.text();
    throw new Error("Failed to start interview: " + txt);
  }
  return res.json();
}

export async function getInterview(id){
  const res = await fetch(`${API_BASE}/interviews/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch interview");
  }
  return res.json();
}

export async function submitAnswer(interview_id, payload){
  const res = await fetch(`${API_BASE}/interviews/${interview_id}/answer`, {
    method: "POST",
    headers: { "Content-Type":"application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    if(res.status === 401) throw new Error("Unauthorized");
    const txt = await res.text();
    throw new Error("Submit failed: " + txt);
  }
  return res.json();
}

export async function finishInterview(interview_id){
  const res = await fetch(`${API_BASE}/interviews/${interview_id}/finish`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to finish interview");
  }
  return res.json();
}

export async function listInterviews(){
  const res = await fetch(`${API_BASE}/interviews/`, {
    headers: { ...getAuthHeaders() }
  });
  if(!res.ok) {
    if(res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch interviews");
  }
  return res.json();
}