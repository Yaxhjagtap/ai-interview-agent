import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getProfile, 
  uploadResume, 
  startInterview, 
  listInterviews
} from "../Services/api";
import { LogoutModal } from "../components/UIComponents";
import ProfileModal from "../components/ProfileModal";
import InterviewView from "../components/InterviewView";

// Import your newly created components
import Sidebar from "../components/Sidebar";
import SetupInterviewModal from "../components/SetupInterviewModal";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [starting, setStarting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [interviewType, setInterviewType] = useState("resume");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");

  const userToggled = useRef(false);

  const filteredInterviews = useMemo(() => {
    if (!searchTerm) return interviews;
    return interviews.filter(i => 
      (i.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.id?.toString().includes(searchTerm))
    );
  }, [interviews, searchTerm]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
      document.body.style.backgroundColor = "";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      document.body.style.backgroundColor = "#f8fafc";
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    fetchProfile();
    fetchInterviews();

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (!userToggled.current) {
        setSidebarOpen(isDesktop);
      } else {
        if (isDesktop && !sidebarOpen) {
          setSidebarOpen(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    window.history.pushState({ isDashboard: true }, null, window.location.href);

    const handlePopState = () => {
      setShowLogoutWarning(true);
      window.history.pushState({ isDashboard: true }, null, window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleAuthError(err) {
    if (err?.response?.status === 401 || err.message === "Unauthorized") {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }

  async function fetchProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (e) {
      handleAuthError(e);
    }
  }

  async function fetchInterviews() {
    try {
      const list = await listInterviews();
      setInterviews(Array.isArray(list) ? list : []);
    } catch (e) {
      handleAuthError(e);
    }
  }

  const onStartWithSetup = () => {
    setShowSetupModal(true);
  };

  const onStartConfirmed = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (interviewType === "company" && (!company.trim() || !role.trim())) {
      alert("Please enter both company and role for company-specific interviews");
      return;
    }
    if (interviewType === "role" && !role.trim()) {
      alert("Please enter a role for role-specific interviews");
      return;
    }

    setStarting(true);
    try {
      const payload = {
        interview_type: interviewType.toLowerCase().trim(),
        company: interviewType === "company" ? company.trim() : "",
        role: (interviewType === "company" || interviewType === "role") ? role.trim() : "",
        experience: experience ? experience.trim() : "",
      };

      const r = await startInterview(payload);
      await fetchInterviews();
      setSelectedId(r.interview_id);
      
      // Reset and close modal
      setShowSetupModal(false);
      setCompany("");
      setRole("");
      setExperience("");
      
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      console.error(err);
      alert("Start failed: " + err.message);
    } finally {
      setStarting(false);
    }
  };

  function confirmLogout() {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  function cancelLogout() {
    setShowLogoutWarning(false);
  }

  const toggleSidebar = () => {
    userToggled.current = true;
    setSidebarOpen(prev => !prev);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-black overflow-hidden relative">
      <LogoutModal
        isOpen={showLogoutWarning}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      <Sidebar 
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredInterviews={filteredInterviews}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        setProfileModalOpen={setProfileModalOpen}
        setShowLogoutWarning={setShowLogoutWarning}
        profile={profile}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black relative">
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-black px-4 py-3 ">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 -ml-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {sidebarOpen && (
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl h-full">
            {selectedId ? (
              <InterviewView
                interviewId={selectedId}
                onRefresh={fetchInterviews}
                onQuit={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-6 px-4">
                  <svg
                    className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-1.125 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                      No Interview Selected
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
                      Choose an interview from the sidebar or start a new one.
                    </p>
                  </div>
                  <button
                    onClick={onStartWithSetup}
                    disabled={starting}
                    className="px-8 py-3 w-full md:w-auto bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {starting ? "Starting..." : "Start New Interview"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SetupInterviewModal 
        isOpen={showSetupModal}
        onClose={() => {
          setShowSetupModal(false);
          setCompany("");
          setRole("");
          setExperience("");
        }}
        onStartConfirmed={onStartConfirmed}
        starting={starting}
        interviewType={interviewType}
        setInterviewType={setInterviewType}
        company={company}
        setCompany={setCompany}
        role={role}
        setRole={setRole}
        experience={experience}
        setExperience={setExperience}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onUploadResume={async (file) => {
          await uploadResume(file);
          const updated = await getProfile();
          setProfile(updated);
        }}
      />
    </div>
  );
}