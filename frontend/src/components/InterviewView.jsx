import React, { useState, useEffect, useRef } from "react";
import AvatarScene from "./AvatarScene";
import AudioRecorder from "./AudioRecorder";
import { getInterview, submitAnswer, finishInterview } from "../Services/api";
import { speak, stopSpeaking } from "../Services/voiceService";
import { QuitModal, ScoreBadgeWithLabel, LastScoreDisplay } from "./UIComponents";

export default function InterviewView({ interviewId, onRefresh, onQuit }) {
  const [data, setData] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [lastTranscriptMeta, setLastTranscriptMeta] = useState(null);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const [showPreviousQuestions, setShowPreviousQuestions] = useState(false);
  const [showLastScore, setShowLastScore] = useState(false);

  const mountedRef = useRef(false);
  const isQuittingRef = useRef(false);
  const previousQuestionsContainerRef = useRef(null);

  const analysis = data?.analysis || {};
  const hasFinished = analysis.overall_score != null;
  const rawQ = data?.questions?.[qIndex];
  const questionText = typeof rawQ === "object" ? rawQ?.question : rawQ;

  useEffect(() => {
    mountedRef.current = true;
    if (interviewId) load();
    return () => {
      mountedRef.current = false;
      stopSpeaking();
    };
  }, [interviewId]);

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

  useEffect(() => {
    if (showPreviousQuestions && previousQuestionsContainerRef.current) {
      setTimeout(() => {
        previousQuestionsContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showPreviousQuestions]);

  async function load() {
    try {
      const r = await getInterview(interviewId);
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
      const res = await submitAnswer(interviewId, {
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
      onRefresh?.();
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
      const r = await finishInterview(interviewId);
      setStatus("");
      await load();

      await speak(`Interview complete. Your overall score is ${r.overall_score} percent.`);
      if (r.top_strengths?.length) await speak("Your strengths: " + r.top_strengths.slice(0, 3).join(", "));
      if (r.top_weaknesses?.length) await speak("Areas to improve: " + r.top_weaknesses.slice(0, 3).join(", "));
      onRefresh?.();
    } catch (e) {
      setStatus("Failed to finish interview");
    } finally {
      setFinishing(false);
    }
  }

  function goToDashboard() {
    isQuittingRef.current = true;
    setShowQuitWarning(false);
    if (onQuit) onQuit();
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5 text-brand-500 dark:text-brand-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading interview...
        </div>
      </div>
    );
  }

  if (!data.questions?.length) {
    return <div className="text-center py-20 text-gray-500 dark:text-gray-400">No questions found for this interview.</div>;
  }

  const chatHistory = data.answers?.map((a, idx) => ({
    question: a.question,
    answer: a.answer,
    score: a.score?.overall_score ?? a.score?.score,
    index: idx,
  })) || [];

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <QuitModal
        isOpen={showQuitWarning}
        onCancel={() => setShowQuitWarning(false)}
        onConfirm={goToDashboard}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">{/* Avatar placeholder */}</div>
      </div>

      <div className="w-full rounded-xl overflow-hidden shadow-lg">
        <AvatarScene />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-2 sm:p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Question {qIndex + 1}
          </h3>
          {lastScore && <ScoreBadgeWithLabel score={lastScore.score} label="Last" />}
        </div>

        <p className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
          {questionText}
        </p>

        {/* --- THE SCROLLBAR FIX IS HERE --- */}
        <div className="relative flex flex-col w-full bg-[#f0f4f9] dark:bg-gray-800 rounded-[28px] overflow-hidden shadow-sm border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-colors min-h-[140px]">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="flex-1 w-full h-full bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none resize-none pt-4 pb-16 pl-5 pr-2 sm:pr-3 text-base sm:text-lg"
            placeholder="Record or Type Your Answer"
            disabled={submitting || hasFinished}
          />
          
          <div className="absolute bottom-2 right-2 flex items-center gap-2 z-10 bg-[#f0f4f9] dark:bg-gray-800 pl-3 pt-2 rounded-tl-2xl">
            {qIndex === data.questions.length - 1 && !hasFinished && (
              <button
                onClick={finish}
                disabled={finishing}
                className="px-4 py-1.5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-medium rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 transition-colors shadow-sm text-sm"
              >
                {finishing ? "..." : "End"}
              </button>
            )}

            <AudioRecorder
              onTranscribed={({ text, segments, duration }) => {
                if (hasFinished) return;
                setAnswerText((prev) => (prev ? prev + " " + text : text));
                setLastTranscriptMeta({ segments, duration });
              }}
            />
            
            {!hasFinished && (
              <button
                onClick={sendAnswer}
                disabled={submitting || !answerText.trim()}
                className="p-3 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:bg-transparent text-white bg-brand-300 hover:bg-brand-600 dark:disabled:text-gray-500"
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        {/* --- END SCROLLBAR FIX --- */}

        {status && (
          <div className="mt-4 text-center text-sm text-brand-600 dark:text-brand-400 font-medium animate-fade-in">
            {status}
          </div>
        )}
      </div>

      {!hasFinished && (
        <div ref={previousQuestionsContainerRef} className="flex items-center justify-between flex-wrap gap-2">
          {lastScore && (
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setShowLastScore(!showLastScore)}
            >
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Last Answer Score
              </h4>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  showLastScore ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {chatHistory.length > 0 ? (
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setShowPreviousQuestions(!showPreviousQuestions)}
            >
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Previous Questions
              </h4>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  showPreviousQuestions ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <div /> 
          )}

          <button
            onClick={() => setShowQuitWarning(true)}
            className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shadow-sm"
          >
            Quit Interview
          </button>
        </div>
      )}

      {showLastScore && lastScore && !hasFinished && (
        <div className="mt-2">
          <LastScoreDisplay lastScore={lastScore} />
        </div>
      )}

      {showPreviousQuestions && chatHistory.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-auto">
          {chatHistory.map((item, idx) => (
            <div key={idx} className="pl-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Q{item.index + 1}</p>
                {item.score !== undefined && <ScoreBadgeWithLabel score={item.score} label="Score" />}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-base mt-1">{item.question}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic">{item.answer}</p>
            </div>
          ))}
        </div>
      )}

      {hasFinished && analysis && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Interview Analysis
          </h4>
          <div className="space-y-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/60 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-100 dark:border-brand-800">
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">{analysis.overall_score}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Overall Score</div>
            </div>

            {analysis.by_category && (
              <div className="grid grid-cols-2 gap-2">
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

            {analysis.improvement_tips?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">Tips</p>
                {analysis.improvement_tips.map((tip, i) => (
                  <p key={i} className="text-xs text-gray-500 dark:text-gray-400">💡 {tip}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}