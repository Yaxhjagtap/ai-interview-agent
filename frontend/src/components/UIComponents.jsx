import React from "react";

export function ScoreBadge({ score }) {
  if (score == null) return <span className="score-badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">—</span>;
  if (score >= 70) return <span className="score-high">{score}%</span>;
  if (score >= 40) return <span className="score-medium">{score}%</span>;
  return <span className="score-low">{score}%</span>;
}

export function ScoreBadgeWithLabel({ score, label }) {
  if (score == null) return null;
  const color =
    score >= 70 ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" :
    score >= 40 ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" :
                  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${color}`}>
      <span className="text-lg font-bold">{score}</span>
      {label && <span className="text-[10px] uppercase tracking-wide font-medium opacity-70">{label}</span>}
    </div>
  );
}

export function ProgressBar({ current, total }) {
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

export function QuitModal({ isOpen, onCancel, onConfirm }) {
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

export function LastScoreDisplay({ lastScore }) {
  if (!lastScore?.details) return null;
  return (
    <div className="p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Last Answer Score</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ScoreBadgeWithLabel score={lastScore.details.overall_score} label="Overall" />
        <ScoreBadgeWithLabel score={lastScore.details.technical} label="Technical" />
        <ScoreBadgeWithLabel score={lastScore.details.communication} label="Communication" />
        <ScoreBadgeWithLabel score={lastScore.details.depth} label="Depth" />
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

export function LogoutModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full animate-slide-up border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Logout?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Are you sure you want to log out of your account?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}