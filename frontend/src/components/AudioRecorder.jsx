// src/components/AudioRecorder.jsx
import React, {useState, useRef} from "react";

export default function AudioRecorder({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRef.current.ondataavailable = e => chunksRef.current.push(e.data);
    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "answer.webm", { type: "audio/webm" });
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/transcribe/", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: fd
      });
      if(!res.ok) {
        const txt = await res.text();
        alert("Transcription failed: " + txt);
        return;
      }
      const data = await res.json();
      // data has: { text, segments, model, duration }
      onTranscribed({
        text: data.text,
        segments: data.segments || [],
        duration: data.duration || 0
      });
    };
    mediaRef.current.start();
    setRecording(true);
  }

  function stopRecording(){
    if(mediaRef.current && mediaRef.current.state !== "inactive"){
      mediaRef.current.stop();
      setRecording(false);
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={startRecording} disabled={recording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!recording} style={{marginLeft:8}}>Stop & Transcribe</button>
    </div>
  );
}
