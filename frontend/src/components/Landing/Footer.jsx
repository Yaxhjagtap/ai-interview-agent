import React from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

export default function Footer() {
  const scrollTo = useSmoothScroll();

  return (
    <footer
      style={{
        background: `
          radial-gradient(ellipse at top left, rgba(184,134,11,0.25) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(212,175,55,0.3) 0%, transparent 50%),
          radial-gradient(ellipse at top right, rgba(139,115,4,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, rgba(184,134,11,0.25) 0%, transparent 50%),
          radial-gradient(ellipse at center, rgba(75,56,10,0.15) 0%, transparent 70%),
          linear-gradient(135deg, #05070F 0%, #0A0F1A 30%, #0B1120 70%, #0F172A 100%)
        `,
        padding: "80px clamp(20px, 4vw, 60px) 40px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        zIndex: 10,
        isolation: "isolate",
        backgroundSize: "400% 400%",
        animation: "auroraShift 18s ease-in-out infinite",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "80px",
            marginBottom: "80px",
          }}
          className="mob-col"
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#3168FF"
                strokeWidth="2.2"
              >
                <path d="M10 1L19 7.5V12.5L10 19L1 12.5V7.5L10 1Z" fill="none" />
                <path
                  d="M10 1V19M1 7.5L19 12.5M19 7.5L1 12.5"
                  stroke="#3168FF"
                  strokeWidth="1.2"
                  opacity=".4"
                />
              </svg>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.6rem",
                  color: "#FFFFFF",
                  letterSpacing: "-0.03em",
                }}
              >
                AceIQ
              </span>
            </div>
            <p
              style={{
                color: "#A0AEC0",
                lineHeight: 1.6,
                maxWidth: "340px",
                fontSize: "1.05rem",
                fontWeight: 500,
              }}
            >
              The most advanced, hyper-realistic AI interview preparation platform designed specifically for
              software engineers.
            </p>
          </div>

          <div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                color: "#FFFFFF",
                marginBottom: "24px",
              }}
            >
              Product
            </div>
            <button
              onClick={() => scrollTo("features")}
              className="fl"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how")}
              className="fl"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo("testimonials")}
              className="fl"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="fl"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              FAQ
            </button>
          </div>

          <div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                color: "#FFFFFF",
                marginBottom: "24px",
              }}
            >
              Legal
            </div>
            <a
              href="#"
              className="fl"
              style={{
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="fl"
              style={{
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="fl"
              style={{
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Cookie Policy
            </a>
            <a
              href="#"
              className="fl"
              style={{
                fontSize: "1rem",
                color: "#A0AEC0",
                marginBottom: "12px",
                display: "block",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEC0")}
            >
              Trust Center
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <span style={{ fontSize: "1rem", color: "#64748B", fontWeight: 600 }}>
            © 2026 AceIQ Inc. All rights reserved.
          </span>
          <span style={{ fontSize: "1rem", color: "#64748B", fontWeight: 600 }}>
            AceIQ is not affiliated with Google, Meta, or any listed employer.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes auroraShift {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        @media (max-width: 900px) {
          .mob-col {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </footer>
  );
}
