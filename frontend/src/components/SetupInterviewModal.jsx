import React from "react";

export default function SetupInterviewModal({
  isOpen,
  onClose,
  onStartConfirmed,
  starting,
  interviewType,
  setInterviewType,
  company,
  setCompany,
  role,
  setRole,
  experience,
  setExperience,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-black rounded-xl shadow-xl p-6 max-w-md w-full mx-auto animate-slide-up">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Setup Interview</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <select
              value={interviewType}
              onChange={(e) => {
                setInterviewType(e.target.value);
                if (e.target.value === "resume") {
                  setCompany("");
                  setRole("");
                }
              }}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="resume">📄 Resume-based (Analyze my resume)</option>
              <option value="company">🏢 Company-specific (e.g., Google, Amazon)</option>
              <option value="role">💼 Role-specific (e.g., Frontend Developer)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {interviewType === "resume" && "Questions will be based on your uploaded resume"}
              {interviewType === "company" && "Questions tailored to specific company interviews"}
              {interviewType === "role" && "Questions focused on specific role requirements"}
            </p>
          </div>

          {(interviewType === "company" || interviewType === "role") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={
                  interviewType === "company"
                    ? "e.g., Software Engineer II"
                    : "e.g., React Developer"
                }
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          )}

          {interviewType === "company" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Experience Level <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Any / Not specified</option>
              <option value="fresher">🎓 Fresher (0-1 years)</option>
              <option value="junior">🌱 Junior (1-3 years)</option>
              <option value="mid">⚡ Mid-level (3-5 years)</option>
              <option value="senior">🚀 Senior (5+ years)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={starting}
          >
            Cancel
          </button>
          <button
            onClick={onStartConfirmed}
            disabled={starting}
            className="px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            {starting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Starting...
              </>
            ) : (
              "Start Interview"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}