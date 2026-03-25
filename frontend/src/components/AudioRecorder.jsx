import React, { useState, useRef } from "react";
import { transcribeUpload } from "../Services/api";

export default function AudioRecorder({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    setLoading(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRef.current.onstop = async () => {
        setLoading(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "answer.webm", { type: "audio/webm" });
        try {
          const data = await transcribeUpload(file);
          onTranscribed({
            text: data.text,
            segments: data.segments || [],
            duration: data.duration || 0,
          });
        } catch (e) {
          alert("Transcription failed: " + (e.message || e));
        } finally {
          setLoading(false);
        }
      };
      mediaRef.current.start();
      setRecording(true);
    } catch (e) {
      alert("Microphone access denied. Please allow microphone permissions in your browser.");
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      // Stop all tracks to release microphone
      mediaRef.current.stream?.getTracks().forEach((t) => t.stop());
      setRecording(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      {loading ? (
        <div className="p-2 flex items-center gap-2 text-[0.75rem] font-bold text-brand-500 dark:text-brand-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="hidden sm:inline">Transcribing...</span>
        </div>
      ) : !recording ? (
        <button
          onClick={startRecording}
          disabled={loading}
          className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-95"
          title="Record Voice Answer"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-800/40 transition-all border border-red-100 dark:border-red-800 active:scale-95"
          title="Stop Recording"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[0.7rem] sm:text-xs uppercase tracking-widest">Stop</span>
        </button>
      )}
    </div>
  );
}