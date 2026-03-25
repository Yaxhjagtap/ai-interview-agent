import React, { useState, useEffect } from "react";
import { login } from "../Services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Trap the Back Button to redirect to Landing Page
  useEffect(() => {
    window.history.pushState({ isLogin: true }, null, window.location.href);

    const handlePopState = () => {
      nav("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await login(form);
      localStorage.setItem("access_token", r.access_token);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setErr(err?.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#ffffff] relative overflow-hidden">
      {/* Blue wave background */}
      <style>{`
        .wave-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.12;
          background-repeat: repeat;
          background-size: 200px 40px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath fill='none' stroke='%233168FF' stroke-width='1.5' d='M0,20 C25,5 75,35 100,20 C125,5 175,35 200,20' /%3E%3C/svg%3E");
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease both;
        }
      `}</style>
      <div className="wave-bg" />

      <div className="w-full max-w-md animate-slide-up relative z-10 my-8 sm:my-0">
        
        {/* Premium Card Container */}
        <div
          className="relative p-6 sm:p-8 md:p-10 bg-[#ffffff] rounded-2xl sm:rounded-[2rem] transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100"
        >
          {/* Back‑to‑home arrow (Moved INSIDE the card for mobile responsiveness) */}
          <Link
            to="/"
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 sm:p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors active:scale-95 border border-blue-100"
            aria-label="Back to home"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#3168FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 pt-8 sm:pt-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-[1rem] flex items-center justify-center mb-4 sm:mb-6 transition-transform duration-300 hover:scale-105 bg-blue-50">
              <svg
                style={{ width: "32px", height: "32px", color: "#3168FF" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B202E] tracking-tight">
              Welcome back
            </h2>
            <p className="text-[0.85rem] sm:text-[0.95rem] text-[#405869] mt-2 font-medium">
              Sign in to continue practicing interviews
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4 sm:space-y-5">
            {/* Email field with icon */}
            <div>
              <label className="block text-[0.65rem] sm:text-[0.75rem] font-bold text-[#8C9CA8] uppercase tracking-widest mb-1.5 sm:mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#8C9CA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  /* text-base (16px) prevents iOS auto-zoom */
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-4 bg-[#F9FBFC] border border-[#E5E0D8] rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#3168FF] focus:ring-1 focus:ring-[#3168FF] focus:shadow-sm transition-all text-[#0B202E] text-base font-semibold placeholder:text-[#8C9CA8]/60"
                />
              </div>
            </div>

            {/* Password field with icon */}
            <div>
              <label className="block text-[0.65rem] sm:text-[0.75rem] font-bold text-[#8C9CA8] uppercase tracking-widest mb-1.5 sm:mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#8C9CA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-4 bg-[#F9FBFC] border border-[#E5E0D8] rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#3168FF] focus:ring-1 focus:ring-[#3168FF] focus:shadow-sm transition-all text-[#0B202E] text-base font-semibold placeholder:text-[#8C9CA8]/60"
                />
              </div>
            </div>

            {err && (
              <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 text-xs sm:text-sm font-bold text-red-600 animate-fade-in flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full py-3 sm:py-4 mt-2 text-[0.95rem] sm:text-[1.05rem] font-extrabold text-white rounded-xl sm:rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #3168FF 0%, #11B4F8 100%)",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 0 12px rgba(49,104,255,0.5), 0 6px 16px rgba(49, 104, 255, 0.15)",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #2552D8 0%, #0EA5E9 100%)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #3168FF 0%, #11B4F8 100%)";
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-[0.9rem] text-[#405869] font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold transition-colors ml-1"
              style={{ color: "#3168FF", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2552D8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3168FF")}
            >
              Create one
            </Link>
          </div>

          {/* Helper text */}
          <p className="mt-4 sm:mt-6 text-center text-[0.65rem] sm:text-xs text-[#8C9CA8]">
            Gain access to AI‑powered mock interviews, real‑time feedback, and a library of 500+ questions.
          </p>
        </div>
      </div>
    </div>
  );
}