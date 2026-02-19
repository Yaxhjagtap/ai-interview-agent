import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AvatarScene from "../components/AvatarScene";
import AudioRecorder from "../components/AudioRecorder";
import { getInterview, submitAnswer, finishInterview } from "../api";

export default function Interview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState("");
  const [lastTranscriptMeta, setLastTranscriptMeta] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const r = await getInterview(id);
    setData(r);
  }

  async function sendAnswer() {
    if (!answerText.trim()) return alert("Type or record your answer");

    const currentIndex = qIndex;

    const res = await submitAnswer(id, {
      question_index: currentIndex,
      answer: answerText,
      transcript_meta: lastTranscriptMeta,
    });

    setStatus("Saved. Score: " + res.score);
    setAnswerText("");
    setLastTranscriptMeta(null);

    await load();

    // move to next question safely
    setQIndex((prev) => {
      if (!data || !data.questions) return prev;
      return prev < data.questions.length - 1 ? prev + 1 : prev;
    });
  }

  async function finish() {
    const r = await finishInterview(id);
    setStatus("Interview finished. Overall score: " + r.overall_score);
    await load();
  }

  if (!data) return <div>Loading...</div>;
  if (!data.questions || data.questions.length === 0)
    return <div>No questions found</div>;

  const rawQuestion = data.questions[qIndex];

  // ✅ Handle both string and object formats
  const questionText =
    typeof rawQuestion === "object"
      ? rawQuestion?.question
      : rawQuestion;

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

          <div
            style={{
              border: "1px solid #ddd",
              padding: 12,
              minHeight: 80,
            }}
          >
            {questionText}
          </div>

          {/* Text Answer Box */}
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            style={{ width: "100%", height: 120, marginTop: 10 }}
            placeholder="Type your answer or use voice..."
          />

          {/* Voice Recorder */}
          <div style={{ marginTop: 8 }}>
            <AudioRecorder
              onTranscribed={({ text, segments, duration }) => {
                setAnswerText((prev) =>
                  prev ? prev + " " + text : text
                );

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
