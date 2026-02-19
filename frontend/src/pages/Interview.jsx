// src/pages/Interview.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AvatarScene from "../components/AvatarScene";
import AudioRecorder from "../components/AudioRecorder";
import { getInterview, submitAnswer, finishInterview } from "../api";
import { speak } from "../services/voiceService";

export default function Interview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState("");
  const [lastTranscriptMeta, setLastTranscriptMeta] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Speak question when data and qIndex change
    if (!data || !data.questions) return;
    const rawQuestion = data.questions[qIndex];
    const questionText = typeof rawQuestion === "object" ? rawQuestion?.question : rawQuestion;
    if (questionText) {
      // small delay so UI updates before speech
      setTimeout(() => speak(`Question ${qIndex + 1}. ${questionText}`), 250);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, qIndex]);

  async function load() {
    try {
      const r = await getInterview(id);
      if (!mountedRef.current) return;
      setData(r);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendAnswer() {
    if (!answerText.trim()) return alert("Type or record your answer");
    const currentIndex = qIndex;
    setStatus("Saving answer...");
    try {
      const res = await submitAnswer(id, {
        question_index: currentIndex,
        answer: answerText,
        transcript_meta: lastTranscriptMeta,
      });

      // speak expected answer + comparison (two short phrases)
      if (res.expected_answer) {
        await speak("Expected answer:");
        await speak(res.expected_answer);
      }
      if (res.comparison) {
        await speak("Comparison:");
        await speak(res.comparison);
      }

      setStatus("Saved. Score: " + res.score);
      setAnswerText("");
      setLastTranscriptMeta(null);

      await load();

      // move to next question safely
      setQIndex((prev) => {
        if (!data || !data.questions) return prev;
        return prev < data.questions.length - 1 ? prev + 1 : prev;
      });
    } catch (e) {
      console.error(e);
      setStatus("Failed to save answer");
    }
  }

  async function finish() {
    if (!window.confirm("Finish interview and generate final analysis?")) return;
    setStatus("Finishing interview...");
    try {
      const r = await finishInterview(id);
      setStatus("Interview finished. Overall score: " + r.overall_score);
      await load();

      // natural spoken analysis (concise)
      await speak("Interview complete. Here is your final analysis.");
      await speak(`Overall score ${r.overall_score} percent.`);

      if (r.top_strengths && r.top_strengths.length) {
        await speak("Top strengths:");
        for (const s of r.top_strengths.slice(0, 4)) {
          await speak(s);
        }
      }

      if (r.top_weaknesses && r.top_weaknesses.length) {
        await speak("Areas to improve:");
        for (const w of r.top_weaknesses.slice(0, 5)) {
          await speak(w);
        }
      }

      if (r.suggested_4_week_plan && r.suggested_4_week_plan.length) {
        await speak("Suggested four week study plan highlights:");
        for (const p of r.suggested_4_week_plan) {
          await speak(p);
        }
      }

      if (r.improvement_tips && r.improvement_tips.length) {
        await speak("Final tips:");
        for (const t of r.improvement_tips.slice(0, 4)) {
          await speak(t);
        }
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to finish interview");
    }
  }

  if (!data) return <div>Loading...</div>;
  if (!data.questions || data.questions.length === 0)
    return <div>No questions found</div>;

  const rawQuestion = data.questions[qIndex];
  // Handle both string and object formats
  const questionText = typeof rawQuestion === "object" ? rawQuestion?.question : rawQuestion;

  return (
    <div>
      <h2>Interview #{id}</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <AvatarScene />
        </div>

        <div style={{ flex: 2 }}>
          <h3>
            Question ({qIndex + 1}/{data.questions.length})
          </h3>

          <div style={{ border: "1px solid #ddd", padding: 12, minHeight: 80 }}>
            {questionText}
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            style={{ width: "100%", height: 120, marginTop: 10 }}
            placeholder="Type your answer or use voice..."
          />

          <div style={{ marginTop: 8 }}>
            <AudioRecorder
              onTranscribed={({ text, segments, duration }) => {
                setAnswerText((prev) => (prev ? prev + " " + text : text));
                setLastTranscriptMeta({
                  segments,
                  duration,
                });
              }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <button onClick={sendAnswer}>Submit Answer</button>
            <button onClick={finish} style={{ marginLeft: 8 }}>
              Finish Interview
            </button>
          </div>

          <div style={{ marginTop: 12 }}>{status}</div>
        </div>
      </div>

      <hr />

      <h4>Answers so far</h4>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data.answers, null, 2)}
      </pre>

      <h4>Analysis</h4>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data.analysis, null, 2)}
      </pre>
    </div>
  );
}
