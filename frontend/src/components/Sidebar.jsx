import React from "react";
import { ScoreBadge } from "../components/UIComponents";

export default function Sidebar({
  sidebarOpen,
  toggleSidebar,
  toggleDarkMode,
  isDarkMode,
  searchTerm,
  setSearchTerm,
  filteredInterviews,
  selectedId,
  setSelectedId,
  setProfileModalOpen,
  setShowLogoutWarning,
  profile,
}) {
  // Helper to generate a meaningful interview label
  const getInterviewLabel = (interview) => {
    if (interview.title) return interview.title;
    switch (interview.interview_type) {
      case "resume":
        return "Resume Interview";
      case "role":
        return `Role: ${interview.role || "Unknown role"}`;
      case "company":
        return `${interview.company || "Company"} - ${interview.role || "Role"}`;
      default:
        return `Interview ${interview.id}`;
    }
  };

  return (
    <>
      {/* 1. Backdrop: Fades smoothly instead of instantly mounting/unmounting */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar container */}
      <aside
        className={`fixed md:relative z-40 inset-y-0 left-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-black transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? "translate-x-0 w-80"
            : "-translate-x-full md:translate-x-0 md:w-16"
        }`}
      >
        <div className="p-3 flex justify-end gap-2">
          {/* Dark Mode Button: Smoothly collapses its width and opacity when sidebar closes */}
          <button
            onClick={toggleDarkMode}
            className={`rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "p-1 w-auto opacity-100" : "p-0 w-0 opacity-0 pointer-events-none overflow-hidden"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-300 ease-in-out"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* 2. Search Box: Fades out smoothly instead of unmounting. Added min-w so it doesn't squish while animating. */}
        <div
          className={`px-4 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "mb-4 opacity-100 max-h-[100px]" : "mb-0 opacity-0 max-h-0 pointer-events-none overflow-hidden"
          }`}
        >
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-w-[200px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out"
          />
        </div>

        {/* 3. List Area: Fades out smoothly */}
        <div
          className={`flex-1 overflow-y-auto px-4 space-y-2 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {filteredInterviews.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 transition-colors duration-300 ease-in-out whitespace-nowrap">
              No interviews yet.
            </p>
          ) : (
            filteredInterviews.map((interview) => (
              <button
                key={interview.id}
                onClick={() => {
                  setSelectedId(interview.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 ease-in-out ${
                  selectedId === interview.id
                    ? "bg-brand-50 dark:bg-brand-900/30"
                    : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate transition-colors duration-300 ease-in-out">
                  {getInterviewLabel(interview)}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300 ease-in-out whitespace-nowrap">
                  {interview.analysis?.overall_score ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>In progress</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                </div>
                {interview.analysis?.overall_score && (
                  <div className="mt-2">
                    <ScoreBadge score={interview.analysis.overall_score} />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* 4. Bottom Profile & Logout: Smoothly collapse their heights/padding so they don't jump */}
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "px-4 mb-4 sm:mb-0" : "px-2 mb-0"}`}>
          <button
            onClick={() => setProfileModalOpen(true)}
            className={`flex items-center gap-3 w-full rounded-xl transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 ${
              sidebarOpen ? "opacity-100 p-2 max-h-[100px]" : "opacity-0 p-0 max-h-0 pointer-events-none overflow-hidden"
            }`}
          >
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {profile?.name?.charAt(0) || profile?.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate transition-colors duration-300 ease-in-out">
                {profile?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300 ease-in-out">
                {profile?.email || "No email"}
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowLogoutWarning(true)}
            className={`w-full text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 ease-in-out active:scale-95 ${
              sidebarOpen ? "mt-3 py-2 sm:py-3 opacity-100 max-h-[100px]" : "mt-0 py-0 opacity-0 max-h-0 pointer-events-none overflow-hidden border-none"
            }`}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}