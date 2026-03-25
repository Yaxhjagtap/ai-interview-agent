import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/**
 * ============================================================================
 * COMPONENT: Navbar
 * DESCRIPTION: An enterprise-grade, glassmorphic fixed navigation bar.
 * Maintains a PERMANENT glass blur at all scroll positions, smoothly 
 * minimizes its height when scrolled, and displays CTAs on mobile.
 * ============================================================================
 */

/**
 * Custom Hook: useSmoothScroll
 * Intercepts anchor links to prevent them from pushing to the window.history stack.
 */
const useSmoothScroll = () => {
  const scrollToId = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset for the fixed navbar
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return scrollToId;
};

/**
 * Sub-Component: AceIQLogo
 * Recreates the exact 3D isometric hexagon logo.
 */
const AceIQLogo = () => (
  <svg 
    width="28" 
    height="28" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#0B202E" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transition: "all 0.3s ease" }}
  >
    {/* Outer Hexagon */}
    <path d="M21 7.5V16.5L12 22L3 16.5V7.5L12 2L21 7.5Z" />
    {/* Inner 3D Lines (The 'Y' shape) */}
    <path d="M12 12V22" />
    <path d="M12 12L21 7.5" />
    <path d="M12 12L3 7.5" />
  </svg>
);

/**
 * MAIN COMPONENT EXPORT
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTo = useSmoothScroll();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  
  // Interrogate local storage for auth state
  const token = localStorage.getItem("access_token");

  // If user is logged in, hide the navbar entirely (dashboard, interview, etc.)
  if (token) return null;

  // If we are on the login or register page, hide the navbar entirely
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  /**
   * Action: Logout
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  /**
   * Action: Mobile Nav Click
   */
  const handleMobileNav = (id) => {
    setMobileMenuOpen(false);
    setTimeout(() => scrollTo(id), 100);
  };

  /**
   * Effect: Handle Scroll State
   * Triggers the "minimized" state when scrolling down.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Effect: Lock body scroll when mobile menu is open
   */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  // Reusable Link Styles
  const linkStyles = {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#405869",
    textDecoration: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "color 0.2s ease",
  };

  return (
    <>
      {/* ─── MAIN FIXED NAVBAR ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          // ANIMATED HEIGHT: Starts tall (88px), shrinks to 64px on scroll
          height: scrolled ? "64px" : "88px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 4vw, 60px)",
          
          // CONSTANT GLASSMORPHIC EFFECT: Always blurred and slightly opaque
          background: mobileMenuOpen ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ─── BRAND AREA ─── */}
        <Link 
          to={token ? "/dashboard" : "/"} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            textDecoration: "none",
            transition: "transform 0.2s ease"
          }}
          onClick={() => setMobileMenuOpen(false)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <AceIQLogo />
          <span 
            style={{ 
              fontWeight: 800, 
              fontSize: "1.35rem", 
              color: "#0B202E", 
              letterSpacing: "-0.04em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: "2px"
            }}
          >
            AceIQ
          </span>
        </Link>

        {/* ─── DESKTOP NAVIGATION LINKS ─── */}
        <div 
          style={{ 
            display: "none", // Hidden by default (mobile)
            gap: "40px", 
            position: "absolute", 
            left: "50%", 
            transform: "translateX(-50%)",
            alignItems: "center"
          }} 
          className="md-flex"
        >
          <button 
            onClick={() => scrollTo("features")} 
            style={linkStyles}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0B202E")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#405869")}
          >
            Features
          </button>
          
          <button 
            onClick={() => scrollTo("how")} 
            style={linkStyles}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0B202E")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#405869")}
          >
            How it Works
          </button>

          {/* Resources Dropdown */}
          <div 
            style={{ position: "relative" }}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button 
              style={linkStyles}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0B202E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#405869")}
            >
              Resources 
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  marginLeft: "4px", 
                  verticalAlign: "middle", 
                  display: "inline-block", 
                  transition: "transform 0.2s ease", 
                  transform: resourcesOpen ? "rotate(180deg)" : "rotate(0deg)" 
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#ffffff",
                color: "#0B202E",
                borderRadius: "16px",
                padding: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
                display: resourcesOpen ? "flex" : "none",
                flexDirection: "column",
                gap: "4px",
                minWidth: "160px",
                marginTop: scrolled ? "10px" : "20px", 
                opacity: resourcesOpen ? 1 : 0,
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ position: "absolute", top: "-20px", left: 0, right: 0, height: "20px" }} />
              
              <button 
                onClick={() => { setResourcesOpen(false); scrollTo("faq"); }} 
                style={{ ...linkStyles, padding: "10px 16px", textAlign: "left", borderRadius: "8px", width: "100%" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0B202E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#405869"; }}
              >
                FAQ
              </button>
              <button 
                onClick={() => { setResourcesOpen(false); scrollTo("testimonials"); }} 
                style={{ ...linkStyles, padding: "10px 16px", textAlign: "left", borderRadius: "8px", width: "100%" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0B202E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#405869"; }}
              >
                Testimonials
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDE (ACTIONS & HAMBURGER) ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          
          {/* Actions (Now explicitly visible on mobile alongside the hamburger) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="action-btn"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: isActive("/dashboard") ? "#3168FF" : "#0B202E",
                    backgroundColor: isActive("/dashboard") ? "rgba(49, 104, 255, 0.08)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive("/dashboard")) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={(e) => { if (!isActive("/dashboard")) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="action-btn"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#EF4444",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="action-btn"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#405869",
                    backgroundColor: "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="action-btn"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    background: "linear-gradient(135deg, #C59A3F 0%, #936B1E 100%)",
                    textDecoration: "none",
                    boxShadow: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #B08835 0%, #7A5716 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #C59A3F 0%, #936B1E 100%)";
                  }}
                >
                  Try for free
                </Link>
              </>
            )}
          </div>

          {/* ─── MOBILE HAMBURGER ICON ─── */}
          <button
            className="md-hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              zIndex: 1001,
            }}
            aria-label="Toggle Navigation"
          >
            <span style={{ 
              display: "block", width: "22px", height: "2px", background: "#0B202E", borderRadius: "2px", transition: "all 0.3s ease",
              transform: mobileMenuOpen ? "rotate(45deg) translateY(10px)" : "none"
            }} />
            <span style={{ 
              display: "block", width: "22px", height: "2px", background: "#0B202E", borderRadius: "2px", transition: "all 0.3s ease",
              opacity: mobileMenuOpen ? 0 : 1
            }} />
            <span style={{ 
              display: "block", width: "22px", height: "2px", background: "#0B202E", borderRadius: "2px", transition: "all 0.3s ease",
              transform: mobileMenuOpen ? "rotate(-45deg) translateY(-10px)" : "none"
            }} />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE FULL-SCREEN OVERLAY ─── */}
      <div 
        style={{
          position: "fixed",
          top: scrolled ? "64px" : "88px",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: mobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "20px" }}>
          <button onClick={() => handleMobileNav("features")} style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B202E", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "24px" }}>Features</button>
          <button onClick={() => handleMobileNav("how")} style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B202E", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "24px" }}>How it Works</button>

          {/* Resources Mobile Group */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "24px" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B202E", textAlign: "left" }}>Resources</span>
            <button onClick={() => handleMobileNav("faq")} style={{ fontSize: "1.2rem", fontWeight: 700, color: "#405869", textAlign: "left", background: "none", border: "none", paddingLeft: "16px" }}>FAQ</button>
            <button onClick={() => handleMobileNav("testimonials")} style={{ fontSize: "1.2rem", fontWeight: 700, color: "#405869", textAlign: "left", background: "none", border: "none", paddingLeft: "16px" }}>Testimonials</button>
          </div>
        </div>

        {/* Buttons duplicated at bottom of overlay just in case they prefer it, but they are also in the top bar */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
          {token ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ width: "100%", padding: "18px", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 800, color: "#0B202E", backgroundColor: "rgba(0,0,0,0.04)", textDecoration: "none", textAlign: "center" }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ width: "100%", padding: "18px", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 800, color: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "none", textAlign: "center" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ width: "100%", padding: "18px", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 800, color: "#0B202E", backgroundColor: "rgba(0,0,0,0.04)", textDecoration: "none", textAlign: "center" }}>
                Log in
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ width: "100%", padding: "18px", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", background: "linear-gradient(135deg, #C59A3F 0%, #936B1E 100%)", textDecoration: "none", textAlign: "center", boxShadow: "none" }}>
                Try for free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Inline styles to handle media queries without external CSS files */}
      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .md-hidden { display: none !important; }
        }
        @media (max-width: 768px) {
          /* Scale down the action buttons slightly so they fit next to the hamburger icon on small screens */
          .action-btn {
            padding: 8px 14px !important;
            font-size: 0.85rem !important;
          }
        }
        @media (max-width: 400px) {
          /* Further scaling for very small screens (like iPhone SE) */
          .action-btn {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </>
  );
}