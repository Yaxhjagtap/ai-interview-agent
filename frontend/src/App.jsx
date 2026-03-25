import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import LoadingAnimation from "./components/LoadingAnimation";
import "./App.css"; // Ensure this is imported

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isInterviewPage = location.pathname.startsWith("/interview/");
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isDashboard = location.pathname === "/dashboard";

  // Landing page: edge‑to‑edge, pure white. 
  // Added h-screen and overflow-y-auto to create an independent scroll context and unfreeze the page.
  if (isLandingPage) {
    return (
      <div className="w-full h-screen bg-white overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    );
  }

  // Login / Register: white background, centered content (Navbar hidden automatically)
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    );
  }

  // Dashboard: full screen, no extra container, no gradient background
  if (isDashboard) {
    return <>{children}</>;
  }

  // Normal layout for Interview (and any other pages)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 text-gray-800">
      {!isInterviewPage && <Navbar />}
      <main className={isInterviewPage ? "" : "max-w-6xl mx-auto px-4 sm:px-6 py-6"}>
        {children}
      </main>
    </div>
  );
}

function RouteLoader({ show }) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(49,104,255,0.08), transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,251,255,0.96))",
        backdropFilter: "blur(12px)",
      }}
    >
      <LoadingAnimation
        width="min(92vw, 720px)"
        height="320px"
        text="Loading your workspace..."
      />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("access_token"), [location.pathname]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const syncToken = () => {
      // forces a rerender if another tab updates auth state
      setLoading((prev) => prev);
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  return (
    <>
      <RouteLoader show={loading} />

      <LayoutWrapper>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/:id" element={<Interview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </>
  );
}