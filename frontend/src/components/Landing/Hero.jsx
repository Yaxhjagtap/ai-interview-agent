import React from "react";
import { Link } from "react-router-dom";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

export default function Hero() {
  const scrollTo = useSmoothScroll();

  return (
    <div 
      style={{ 
        width: "100%",
        backgroundColor: "#ffffff", 
        /* Removed static 180px padding and let Flexbox center it perfectly */
        padding: "0 clamp(20px, 4vw, 60px)", 
        minHeight: "100vh", /* ✨ UTILIZES FULL SCREEN ✨ */
        textAlign: "center", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", /* Centers vertically */
      }}
    >
      <style>
        {`
          @keyframes internalGlowPulse {
            0% { 
              background-position: 0% 50%;
              filter: brightness(1) saturate(1); 
            }
            100% { 
              background-position: 100% 50%;
              filter: brightness(1.35) saturate(1.1); 
            }
          }
          
          .glowing-headline {
            background: linear-gradient(135deg, #0B202E 0%, #3168FF 30%, #ffffff 50%, #11B4F8 70%, #0B202E 100%);
            background-size: 400% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
            animation: internalGlowPulse 3s ease-in-out infinite alternate;
          }

          /* Smooth Aurora Blue Animation */
          @keyframes auroraBlue {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <h1 
        className="fu1 hero-h1" 
        style={{
          fontSize: "clamp(2.75rem, 5vw, 4.5rem)", 
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: "#0B202E",
          maxWidth: "900px", 
          margin: "0 auto 24px",
        }}
      >
        Master your next<br />
        <span className="glowing-headline">technical interview</span>
      </h1>

      <p 
        className="fu2 text-slate" 
        style={{
          fontSize: "clamp(1rem, 1.5vw, 1.15rem)", 
          lineHeight: 1.65,
          maxWidth: "650px", 
          margin: "0 auto 48px",
          fontWeight: 500
        }}
      >
        AceIQ is the ultimate AI engineering coach. It analyzes your resume, 
        conducts hyper-realistic mock loops, and provides actionable, matrix-driven feedback.
      </p>

      <div 
        className="fu3" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "16px", 
          marginBottom: "40px" 
        }}
      >
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          
          <Link 
            to="/register" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              height: "56px", /* Explicit height to match the ghost button */
              padding: "0 36px",
              borderRadius: "999px",
              fontSize: "1.05rem",
              fontWeight: 800,
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 1,
              boxSizing: "border-box",

              /* --- AURORA BLUE INSIDE --- */
              background: "linear-gradient(135deg, #007CF0 0%, #00DFD8 25%, #3168FF 50%, #11B4F8 75%, #007CF0 100%)",
              backgroundSize: "400% 400%",
              animation: "auroraBlue 10s ease infinite",

              /* --- INTERNAL GLOW ADDED --- */
              boxShadow: "inset 0 0 25px rgba(255, 255, 255, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.animation = "auroraBlue 4s ease infinite";
              e.currentTarget.style.boxShadow = "inset 0 0 35px rgba(255, 255, 255, 0.45), inset 0 2px 15px rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.animation = "auroraBlue 10s ease infinite";
              e.currentTarget.style.boxShadow = "inset 0 0 25px rgba(255, 255, 255, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)";
            }}
          >
            Start Practicing Free
            <svg style={{ marginLeft: "8px" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          <button 
            onClick={() => scrollTo("how")} 
            className="btn-ghost"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "56px", /* Matched explicitly */
              padding: "0 32px",
              fontSize: "1.05rem",
              fontWeight: 800, /* Matched with primary button */
              gap: "10px",
              boxSizing: "border-box"
            }}
          >
            {/* ✨ YouTube Icon ✨ */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.582 6.186a2.708 2.708 0 0 0-1.904-1.914C17.997 3.8 12 3.8 12 3.8s-5.997 0-7.678.472a2.708 2.708 0 0 0-1.904 1.914C1.946 7.876 1.946 12 1.946 12s0 4.124.472 5.814a2.708 2.708 0 0 0 1.904 1.914C5.997 20.2 12 20.2 12 20.2s5.997 0 7.678-.472a2.708 2.708 0 0 0 1.904-1.914C22.054 16.124 22.054 12 22.054 12s0-4.124-.472-5.814z" fill="#FF0000"/>
              <path d="M9.945 15.569V8.431L16.128 12l-6.183 3.569z" fill="#ffffff"/>
            </svg>
            See  how  it works  ?
          </button>
        </div>
      </div>
    </div>
  );
}