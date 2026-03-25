import React, { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Landing/Hero";
import LogoStrip from "../components/Landing/LogoStrip";
import SeeHow from "../components/Landing/SeeHow";
import Testimonials from "../components/Landing/Testimonials";
import HowItWorks from "../components/Landing/HowItWorks";
import FAQ from "../components/Landing/FAQ";
import BottomCTA from "../components/Landing/BottomCTA";
import Footer from "../components/Landing/Footer";

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

/* ✨ AGGRESSIVE RESET TO KILL VITE'S DEFAULT GRAY BORDERS ✨ */
html, body, #root, .App {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background-color: #ffffff !important;
  background: #ffffff !important;
  overflow-x: hidden !important;
}

*, *::before, *::after { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

html { 
  scroll-behavior: smooth; 
}

body {
  color: #0B202E; 
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection { 
  background: rgba(49, 104, 255, 0.2); 
  color: #0B202E;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #DCD6CD; border-radius: 3px; }

.text-navy { color: #0B202E; }
.text-slate { color: #405869; }
.text-cyan { color: #11B4F8; }
.text-brand { color: #3168FF; }
.text-gold { color: #BC8E2D; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes arrowBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
@keyframes marq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.fu0 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
.fu1 { animation: fadeUp 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
.fu2 { animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
.fu3 { animation: fadeUp 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
.fu4 { animation: fadeUp 0.8s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

.sr { opacity: 0; transform: translateY(24px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.sr.v { opacity: 1; transform: none; }

.cyan-bubble {
  background: linear-gradient(135deg, #11B4F8 0%, #009FE3 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 10px 24px;
  border-radius: 24px 24px 0px 24px; 
  display: inline-flex;
  align-items: center;
  box-shadow: 0 8px 24px rgba(17, 180, 248, 0.3);
  position: relative;
}

.btn-blue {
  background: linear-gradient(135deg, #3168FF 0%, #11B4F8 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 16px 36px;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(49, 104, 255, 0.25);
}
.btn-blue:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(49, 104, 255, 0.35); color: #fff; }

.btn-ghost {
  color: #0B202E;
  background: #fff;
  border: 1.5px solid #E5E0D8;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 15px 36px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-ghost:hover { background: #F9F8F6; color: #0B202E; border-color: #DCD6CD; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.04); }

.tab-container { display: flex; width: 100%; max-width: 800px; margin: 40px auto 0; border-bottom: 2px solid #F0ECE4; }
.tab-btn { flex: 1; text-align: center; padding: 20px 0; font-size: 1.25rem; font-weight: 700; color: #8C9CA8; background: none; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px; cursor: pointer; transition: all 0.3s ease; }
.tab-btn:hover { color: #405869; }
.tab-btn.active { color: #0B202E; border-bottom-color: #11B4F8; }

.feat-card { background: #ffffff; border-radius: 32px; overflow: hidden; position: relative; min-height: 460px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.04); }
.how-card { background: linear-gradient(180deg, #ffffff 0%, #F9FBFC 100%); border-radius: 24px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 10px 40px rgba(0,0,0,0.03); overflow: hidden; height: 100%; display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.how-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.06); }

.mwrap { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.mtrack { display: flex; width: max-content; animation: marq 45s linear infinite; align-items: center; }
.mtrack:hover { animation-play-state: paused; }

.faq-item { border-bottom: 1px solid #E5E0D8; padding: 28px 0; cursor: pointer; transition: all 0.3s ease; }
.faq-question { font-size: 1.25rem; font-weight: 800; color: #0B202E; display: flex; justify-content: space-between; align-items: center; transition: color 0.2s ease; line-height: 1.4; }
.faq-item:hover .faq-question { color: #3168FF; }
.faq-answer { font-size: 1.05rem; color: #405869; line-height: 1.7; margin-top: 16px; display: none; font-weight: 500; }
.faq-item.active .faq-answer { display: block; animation: fadeIn 0.4s ease; }
.faq-icon { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); color: #8C9CA8; }
.faq-item.active .faq-icon { transform: rotate(45deg); color: #3168FF; }

@media (max-width: 768px) {
  .hero-h1 { font-size: 3.2rem !important; line-height: 1.1 !important; }
  .mob-col { grid-template-columns: 1fr !important; gap: 40px !important; }
  .hide-m { display: none !important; }
  .feat-card { min-height: 360px; }
  .tab-btn { font-size: 1rem; padding: 12px 0; }
}

/* ---------- BLUE WAVE BACKGROUND (low transparency) ---------- */
.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;  /* so it doesn't block clicks */
  z-index: 0;
  opacity: 0.12;         /* low transparency */
  background-repeat: repeat;
  background-size: 200px 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath fill='none' stroke='%233168FF' stroke-width='1.5' d='M0,20 C25,5 75,35 100,20 C125,5 175,35 200,20' /%3E%3C/svg%3E");
}
`;

function useReveal() {
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -60px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("v"); }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".sr");
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  
  useReveal();

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = GLOBAL_STYLES;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.history.pushState({ entry: true }, null, window.location.href);
    const handlePopState = () => { window.location.href = "https://www.google.com"; };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div style={{ 
      background: "#ffffff", 
      minHeight: "100vh", 
      position: "relative",   // needed for absolute positioning of wave-bg
      width: "100%",
      overflowX: "hidden" 
    }}>
      {/* Blue wave background (low transparency) */}
      <div className="wave-bg" />

      <Navbar />
      <Hero />
      <LogoStrip />
      <SeeHow />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <BottomCTA />
      <Footer />

      {scrolled && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ 
            position: "fixed", bottom: "40px", right: "40px", zIndex: 90, 
            width: "56px", height: "56px", background: "#fff", 
            border: "1.5px solid #F0ECE4", borderRadius: "50%", 
            cursor: "pointer", display: "flex", alignItems: "center", 
            justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", 
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(49,104,255,0.2)";
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "#3168FF";
            e.currentTarget.style.color = "#3168FF";
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#F0ECE4";
            e.currentTarget.style.color = "#0B202E";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}