import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvatarScene from "../components/AvatarScene";
import AudioRecorder from "../components/AudioRecorder";
import { getInterview, submitAnswer, finishInterview } from "../Services/api";
import { speak, stopSpeaking } from "../Services/voiceService";

// ============================================================================
// 1. REUSABLE UI COMPONENTS
// ============================================================================

function ScoreBadge({ score, label }) {
  if (score == null) return null;
  let colorClasses = "";
  if (score >= 70) {
    colorClasses = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  } else if (score >= 40) {
    colorClasses = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  } else {
    colorClasses = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  }
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${colorClasses}`}>
      <span className="text-lg font-bold">{score}</span>
      {label && <span className="text-[10px] uppercase tracking-wide font-medium opacity-70">{label}</span>}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Question {current + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuitModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full animate-slide-up border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quit Interview?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Are you sure you want to leave? Your progress so far has been saved, but the interview is incomplete.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Resume Interview
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            Yes, Quit
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. SECTION COMPONENTS
// ============================================================================

function LastScoreDisplay({ lastScore }) {
  if (!lastScore?.details) return null;
  return (
    <div className="glass-card p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl animate-slide-up">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Last Answer Score
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <ScoreBadge score={lastScore.details.overall_score} label="Overall" />
        <ScoreBadge score={lastScore.details.technical} label="Technical" />
        <ScoreBadge score={lastScore.details.communication} label="Communication" />
        <ScoreBadge score={lastScore.details.depth} label="Depth" />
      </div>
      {lastScore.details.tips?.length > 0 && (
        <div className="mt-3 space-y-1">
          {lastScore.details.tips.slice(0, 2).map((tip, i) => (
            <p key={i} className="text-xs text-gray-500 dark:text-gray-400 flex gap-1.5">
              <span className="text-brand-500 dark:text-brand-400">💡</span> {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function InterviewHistory({ answers }) {
  return (
    <div className="glass-card p-4 sm:p-5 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Answers ({answers?.length || 0})
      </h4>
      <div className="space-y-2 max-h-80 overflow-auto pr-1">
        {answers?.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No answers submitted yet.</p>
        ) : (
          answers?.map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    Q{(a.question_index ?? i) + 1}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{a.question}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.answer}</p>
                </div>
                <ScoreBadge score={a.score?.overall_score ?? a.score?.score ?? 0} label="Score" />
              </div>
              {(a.score?.strengths?.length > 0 || a.score?.weaknesses?.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.score.strengths?.slice(0, 2).map((st, idx) => (
                    <span
                      key={`s${idx}`}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
                    >
                      ✓ {st}
                    </span>
                  ))}
                  {a.score.weaknesses?.slice(0, 2).map((wk, idx) => (
                    <span
                      key={`w${idx}`}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-500 dark:text-red-300"
                    >
                      △ {wk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InterviewAnalysis({ analysis, hasFinished }) {
  return (
    <div className="glass-card p-4 sm:p-5 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Analysis
      </h4>
      {hasFinished ? (
        <div className="space-y-4 animate-slide-up">
          {/* Overall score */}
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/60 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-100 dark:border-brand-800">
            <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">{analysis.overall_score}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Overall Score</div>
          </div>

          {/* Category scores */}
          {analysis.by_category && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ["Technical", analysis.by_category.technical_avg],
                ["Communication", analysis.by_category.communication_avg],
                ["Depth", analysis.by_category.depth_avg],
                ["Resume Match", analysis.by_category.resume_match_avg],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{val ?? "—"}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {analysis.top_strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Strengths</p>
              <div className="flex flex-wrap gap-1">
                {analysis.top_strengths.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.top_weaknesses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-1">Areas to Improve</p>
              <div className="flex flex-wrap gap-1">
                {analysis.top_weaknesses.map((w, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-500 dark:text-red-300">
                    △ {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {analysis.improvement_tips?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">Tips</p>
              {analysis.improvement_tips.map((tip, i) => (
                <p key={i} className="text-xs text-gray-500 dark:text-gray-400">💡 {tip}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          Complete the interview to see your full analysis.
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. MAIN INTERVIEW CONTROLLER
// ============================================================================

export default function Interview() {
  // --- State & Initialization ---
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [lastTranscriptMeta, setLastTranscriptMeta] = useState(null);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  
  const mountedRef = useRef(false);
  const isQuittingRef = useRef(false);

  const analysis = data?.analysis || {};
  const hasFinished = analysis.overall_score != null;
  const rawQ = data?.questions?.[qIndex];
  const questionText = typeof rawQ === "object" ? rawQ?.question : rawQ;

  // --- Effects & Event Listeners ---
  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (data && !hasFinished) {
        e.preventDefault();
        e.returnValue = "You have an interview in progress. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [data, hasFinished]);

  useEffect(() => {
    if (hasFinished) return;
    window.history.pushState({ isDummy: true }, null, window.location.href);

    const handlePopState = (event) => {
      if (isQuittingRef.current) return; 
      window.history.pushState({ isDummy: true }, null, window.location.href);
      setShowQuitWarning(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasFinished]);

  useEffect(() => {
    if (questionText && !hasFinished) {
      const timer = setTimeout(() => speak(`Question ${qIndex + 1}. ${questionText}`), 400);
      return () => clearTimeout(timer);
    }
  }, [questionText, qIndex, hasFinished]);

  // --- API Handlers ---
  async function load() {
    try {
      const r = await getInterview(id);
      if (mountedRef.current) {
        setData(r);
        if (r.next_question_index != null) setQIndex(r.next_question_index);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function sendAnswer() {
    if (!answerText.trim()) return alert("Type or record your answer first");
    setSubmitting(true);
    setStatus("Evaluating your answer...");
    try {
      const res = await submitAnswer(id, {
        question_index: qIndex,
        answer: answerText,
        transcript_meta: lastTranscriptMeta,
      });

      setLastScore(res);
      if (res.expected_answer) {
        await speak("Here's what a good answer looks like:");
        await speak(res.expected_answer);
      }
      if (res.comparison) await speak(res.comparison);

      setStatus("");
      setAnswerText("");
      setLastTranscriptMeta(null);
      await load();
      
    } catch (e) {
      console.error(e);
      setStatus("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function finish() {
    if (!window.confirm("Finish the interview and get your final analysis?")) return;
    setFinishing(true);
    setStatus("Generating analysis...");
    try {
      const r = await finishInterview(id);
      setStatus("");
      await load();

      await speak(`Interview complete. Your overall score is ${r.overall_score} percent.`);
      if (r.top_strengths?.length) await speak("Your strengths: " + r.top_strengths.slice(0, 3).join(", "));
      if (r.top_weaknesses?.length) await speak("Areas to improve: " + r.top_weaknesses.slice(0, 3).join(", "));
    } catch (e) {
      setStatus("Failed to finish interview");
    } finally {
      setFinishing(false);
    }
  }

  // --- Navigation Helpers ---
  function goToDashboardCleanly() {
    isQuittingRef.current = true;
    setShowQuitWarning(false);
    navigate(-1);
    setTimeout(() => navigate("/dashboard", { replace: true }), 100);
  }

  // --- Early Returns ---
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 bg-slate-50 dark:bg-black min-h-screen">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading interview...
        </div>
      </div>
    );
  }

  if (!data.questions?.length) {
    return <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-black min-h-screen">No questions found for this interview.</div>;
  }

  // --- Main Render Layout ---
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-slate-50 dark:bg-black min-h-screen relative z-0">
      
      <QuitModal 
        isOpen={showQuitWarning} 
        onCancel={() => setShowQuitWarning(false)} 
        onConfirm={goToDashboardCleanly} 
      />

      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div className="flex-1 w-full">
          <ProgressBar current={qIndex} total={data.questions.length} />
        </div>
        {!hasFinished && (
          <button
            onClick={() => setShowQuitWarning(true)}
            className="shrink-0 self-end sm:self-auto px-4 py-1.5 text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shadow-sm"
          >
            Quit Interview
          </button>
        )}
      </div>

      {/* Main Interaction Area (Responsive Flex Col/Row) */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        
        {/* Left: Avatar */}
        <div className="w-full md:w-[340px] shrink-0">
          <div className="avatar-card bg-white dark:bg-gray-900 shadow-sm p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <AvatarScene />
            <div className="mt-3 text-center">
              <div className="text-base font-semibold text-gray-700 dark:text-gray-300">AI Interviewer</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Calm · Professional · Objective</div>
            </div>
          </div>
        </div>

        {/* Right: Interaction Board */}
        <div className="flex-1 w-full space-y-4">
          <div className="glass-card p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Question {qIndex + 1}
              </h3>
              {lastScore && <ScoreBadge score={lastScore.score} label="Last" />}
            </div>

            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{questionText}</p>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="input-glass mt-4 !h-32 resize-none w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Type your answer or use voice recording..."
              disabled={submitting || hasFinished}
            />

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <AudioRecorder
                onTranscribed={({ text, segments, duration }) => {
                  if (hasFinished) return;
                  setAnswerText((prev) => (prev ? prev + " " + text : text));
                  setLastTranscriptMeta({ segments, duration });
                }}
              />

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {!hasFinished && (
                  <button
                    onClick={sendAnswer}
                    disabled={submitting || !answerText.trim()}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {submitting ? "Evaluating..." : "Submit"}
                  </button>
                )}
                {qIndex === data.questions.length - 1 && !hasFinished && (
                  <button
                    onClick={finish}
                    disabled={finishing}
                    className="btn-secondary w-full sm:w-auto text-sm font-medium px-5 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {finishing ? "Finishing..." : "End Interview"}
                  </button>
                )}
                {hasFinished && (
                  <button
                    onClick={goToDashboardCleanly}
                    className="btn-primary w-full sm:w-auto text-sm font-medium px-5 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
            </div>

            {status && <div className="mt-3 text-sm text-brand-600 dark:text-brand-400 font-medium animate-fade-in">{status}</div>}
          </div>

          <LastScoreDisplay lastScore={lastScore} />
        </div>
      </div>

      {/* Bottom Area (Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <InterviewHistory answers={data.answers} />
        <InterviewAnalysis analysis={analysis} hasFinished={hasFinished} />
      </div>
    </div>
  );
}