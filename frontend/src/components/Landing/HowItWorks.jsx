import React, { useState, useEffect } from "react";

// --- PREMIUM SVG ICONS ---
const Icons = {
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  ),
  Device: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  Mic: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M5 12H2m20 0h-3m-3.46-7.54l-2.12 2.12M7.54 17.46l-2.12 2.12m13.04 0l-2.12-2.12M7.54 6.54L5.42 4.42" />
    </svg>
  ),
  AI: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
       <path d="M12 3v3m0 12v3M5 12H2m20 0h-3m-3.46-7.54l-2.12 2.12M7.54 17.46l-2.12 2.12m13.04 0l-2.12-2.12M7.54 6.54L5.42 4.42" /><circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  )
};

export default function HowItWorks() {
  // Card 1 dynamic text
  const [notificationText, setNotificationText] = useState("Your Netflix mock is ready...");
  const [textIndex, setTextIndex] = useState(0);
  const [ringActive, setRingActive] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const notificationOptions = [
    "Your Netflix mock is ready...",
    "System Design drill prepared",
    "Behavioral prompt generated",
    "New weak spot detected"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % notificationOptions.length);
      setNotificationText(notificationOptions[(textIndex + 1) % notificationOptions.length]);
      setRingActive(true);
      setTimeout(() => setRingActive(false), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, [textIndex, notificationOptions]);

  // Simulate loading bar (sync progress)
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 300);
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <section id="how" style={{ padding: "0 clamp(20px, 4vw, 60px) 140px", background: "#ffffff" }}>
      <style>
        {`
          /* ----- ULTRA-REALISTIC ENHANCEMENTS ----- */
          :root {
            --ease-spring: cubic-bezier(0.34, 1.2, 0.64, 1);
            --ease-smooth: cubic-bezier(0.2, 0.9, 0.4, 1.1);
            --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }

          /* ----- CARD 1: Enhanced Proactive Guidance ----- */
          @keyframes dataFlow {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          .data-stream-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(90deg, transparent 95%, rgba(49,104,255,0.1) 100%),
              radial-gradient(circle at 2px 2px, rgba(49,104,255,0.2) 1px, transparent 1px);
            background-size: 30px 30px, 20px 20px;
            animation: dataFlow 20s linear infinite;
            pointer-events: none;
            z-index: 0;
          }

          /* Additional wave effect */
          @keyframes waveMove {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .wave-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 40px;
            background: linear-gradient(90deg, transparent, rgba(49,104,255,0.2), transparent);
            filter: blur(6px);
            animation: waveMove 6s linear infinite;
            pointer-events: none;
          }

          @keyframes ringBell {
            0% { transform: rotate(0deg) scale(1); }
            20% { transform: rotate(18deg) scale(1.08); }
            40% { transform: rotate(-12deg) scale(1.05); }
            60% { transform: rotate(8deg) scale(1.02); }
            80% { transform: rotate(-4deg) scale(1); }
            100% { transform: rotate(0deg) scale(1); }
          }
          .ring-animation {
            animation: ringBell 0.6s var(--ease-bounce);
          }

          /* Pulse ring around bell */
          @keyframes pulseRing {
            0% { box-shadow: 0 0 0 0 rgba(49,104,255,0.4); opacity: 1; }
            70% { box-shadow: 0 0 0 15px rgba(49,104,255,0); opacity: 0; }
            100% { box-shadow: 0 0 0 0 rgba(49,104,255,0); opacity: 0; }
          }
          .pulse-ring {
            position: absolute;
            top: -5px;
            left: -5px;
            width: 54px;
            height: 54px;
            border-radius: 12px;
            pointer-events: none;
            animation: pulseRing 0.8s ease-out;
          }

          @keyframes textSlideGlow {
            0% { transform: translateY(5px); opacity: 0.7; text-shadow: 0 0 0 rgba(49,104,255,0); }
            30% { transform: translateY(-2px); opacity: 1; text-shadow: 0 0 12px rgba(49,104,255,0.8); }
            100% { transform: translateY(0); opacity: 1; text-shadow: 0 0 0 rgba(49,104,255,0); }
          }
          .text-update-glow {
            animation: textSlideGlow 0.45s var(--ease-spring);
          }

          /* Loading bar simulation */
          .sync-progress {
            margin-top: 12px;
            height: 3px;
            background: rgba(49,104,255,0.2);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .sync-progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #3168FF, #8B5CF6);
            border-radius: 4px;
            transition: width 0.3s linear;
          }

          /* Floating particles (data packets) */
          @keyframes floatParticle {
            0% { transform: translateY(0) scale(1); opacity: 0.8; }
            100% { transform: translateY(-80px) scale(0.2); opacity: 0; }
          }
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #3168FF, #8B5CF6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 2;
            animation: floatParticle 2s forwards;
          }

          /* ----- CARD 2 & 3 (unchanged) ----- */
          /* ... keep all existing styles for cards 2 and 3 ... */
          @keyframes scanLineEnhanced {
            0% { top: -10%; opacity: 0; transform: scaleX(0.6) skewX(-5deg); filter: blur(0px); }
            10% { opacity: 1; filter: blur(1px); }
            50% { filter: blur(0px); transform: scaleX(1); }
            90% { opacity: 1; filter: blur(1px); }
            100% { top: 110%; opacity: 0; transform: scaleX(1.2) skewX(5deg); filter: blur(2px); }
          }
          .scan-bar-enhanced {
            position: absolute;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, #3168FF, #fff, #3168FF, transparent);
            animation: scanLineEnhanced 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            filter: drop-shadow(0 0 4px #3168FF);
            z-index: 2;
          }

          @keyframes tagPulse {
            0% { transform: scale(1); background-color: #fff; box-shadow: 0 0 0 0 rgba(49,104,255,0.4); }
            30% { transform: scale(1.03); background-color: #eef4ff; box-shadow: 0 0 0 10px rgba(49,104,255,0.2); }
            70% { transform: scale(1.02); background-color: #f5f9ff; box-shadow: 0 0 0 5px rgba(49,104,255,0.1); }
            100% { transform: scale(1); background-color: #fff; box-shadow: 0 0 0 0 rgba(49,104,255,0); }
          }
          .memory-tag.active-pulse {
            animation: tagPulse 0.8s var(--ease-spring);
          }

          @keyframes savingSpin {
            0% { transform: rotate(0deg); opacity: 0; }
            20% { opacity: 1; transform: rotate(0deg); }
            80% { opacity: 1; transform: rotate(360deg); }
            100% { transform: rotate(360deg); opacity: 0; }
          }
          .saving-indicator {
            position: absolute;
            right: 12px;
            top: 12px;
            width: 20px;
            height: 20px;
            border: 2px solid #3168FF;
            border-top-color: transparent;
            border-radius: 50%;
            animation: savingSpin 1s linear infinite;
            opacity: 0;
            filter: drop-shadow(0 0 3px #3168FF);
          }
          .saving-indicator.show {
            opacity: 1;
          }

          .memory-tag {
            transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
          }
          .memory-tag:hover {
            transform: translateX(5px) scale(1.02);
            box-shadow: 0 8px 18px rgba(0,0,0,0.1);
          }

          @keyframes orbit {
            from { transform: rotate(0deg) translateX(72px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(72px) rotate(-360deg); }
          }
          .orbit-node {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 42px;
            height: 42px;
            margin-left: -21px;
            margin-top: -21px;
            transform-origin: 0 0;
            animation: orbit 14s linear infinite;
            will-change: transform;
          }
          .orbit-node:nth-child(1) { animation-duration: 16s; animation-delay: 0s; }
          .orbit-node:nth-child(2) { animation-duration: 18s; animation-delay: -6s; }
          .orbit-node:nth-child(3) { animation-duration: 20s; animation-delay: -12s; }

          .node {
            transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
          }
          .node:hover {
            transform: scale(1.18);
            box-shadow: 0 12px 24px rgba(49,104,255,0.25);
          }

          @keyframes rotateBorder {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotating-border {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px dashed;
            border-image: linear-gradient(45deg, #3168FF, #8B5CF6, #F43F5E, #3168FF) 1;
            border-radius: 50%;
            animation: rotateBorder 12s linear infinite;
            pointer-events: none;
            filter: drop-shadow(0 0 3px rgba(49,104,255,0.6));
          }

          @keyframes centralPulse {
            0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(49,104,255,0)); }
            50% { transform: scale(1.12); filter: drop-shadow(0 0 8px rgba(49,104,255,0.8)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(49,104,255,0)); }
          }
          .central-ai {
            animation: centralPulse 2.4s infinite ease-in-out;
            transition: transform 0.1s;
          }

          @keyframes particleFloating {
            0% { transform: translate(0,0) scale(1); opacity: 0.9; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
          }
          .particle {
            position: absolute;
            width: 5px;
            height: 5px;
            background: radial-gradient(circle, #3168FF, #8B5CF6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 3;
            animation: particleFloating 1s forwards;
            filter: blur(1px);
          }

          /* ----- GLOBAL CARD ENHANCEMENTS (No aurora) ----- */
          .how-card {
            background: #ffffff;
            border-radius: 32px;
            border: 1px solid rgba(0,0,0,0.05);
            overflow: hidden;
            transition: all 0.5s var(--ease-spring);
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 
              0 1px 2px rgba(0,0,0,0.02),
              0 4px 12px rgba(0,0,0,0.03),
              0 10px 25px -8px rgba(0,0,0,0.05),
              inset 0 1px 0 rgba(255,255,255,0.8);
            will-change: transform, box-shadow;
          }
          .how-card:hover {
            transform: translateY(-12px) scale(1.01);
            box-shadow: 
              0 2px 3px rgba(0,0,0,0.03),
              0 8px 20px rgba(0,0,0,0.08),
              0 20px 40px -12px rgba(0,0,0,0.12),
              inset 0 1px 0 rgba(255,255,255,0.9);
            border-color: #3168FF;
          }

          .how-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 100%);
            pointer-events: none;
            z-index: 1;
            border-radius: inherit;
          }

          .visual-area {
            height: 260px;
            background: #F8FAFC;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            overflow: hidden;
            border-bottom: 1px solid rgba(0,0,0,0.04);
          }

          .smart-notif {
            background: #fff;
            padding: 20px;
            border-radius: 24px;
            width: 100%;
            box-shadow: 0 15px 30px rgba(0,0,0,0.08);
            display: flex;
            gap: 15px;
            animation: float 4s var(--ease-smooth) infinite;
            position: relative;
            z-index: 2;
            transition: box-shadow 0.3s, transform 0.2s;
          }
          .smart-notif:hover {
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
            transform: scale(1.02);
          }

          .icon-box-blue {
            width: 44px; height: 44px; border-radius: 12px;
            background: #3168FF; color: white;
            display: flex; align-items: center; justify-content: center;
            animation: pulseGlow 2s infinite;
          }

          .memory-vault {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            position: relative;
            z-index: 2;
          }

          .network-circle {
            width: 150px; height: 150px;
            border: 2px dashed #CBD5E1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          @media (max-width: 900px) {
            .mob-col { grid-template-columns: 1fr !important; gap: 40px !important; }
            .how-card { height: auto; }
          }
        `}
      </style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#916A28", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>AUTOMATION</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, color: "#0B202E", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 auto 24px" }}>
            The AI assistant that actually<br/>understands engineering.
          </h2>
          <p className="text-slate" style={{ fontSize: "clamp(1rem, 1.5vw, 1.1rem)", maxWidth: "650px", margin: "0 auto 80px", lineHeight: 1.6, fontWeight: 500 }}>
            AceIQ analyzes your resume, drafts customized behavioral prompts, and runs autonomous technical interviews tailored to your exact target company.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="mob-col">
          
          {/* CARD 1: Proactive Guidance (ENHANCED) */}
          <div className="how-card">
            <div className="visual-area">
              <div className="data-stream-bg"></div>
              <div className="wave-overlay"></div>
              <div className="smart-notif">
                <div className="icon-box-blue" style={{ position: "relative" }}>
                  {ringActive && <div className="pulse-ring"></div>}
                  <div className={ringActive ? "ring-animation" : ""} style={{ display: "inline-flex" }}>
                    <Icons.Bell />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.65rem", color: "#8C9CA8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>System Sync</div>
                  <div 
                    key={notificationText}
                    style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0B202E", marginTop: "2px" }}
                    className="text-update-glow"
                  >
                    {notificationText}
                  </div>
                  <div className="sync-progress">
                    <div className="sync-progress-fill" style={{ width: `${loadingProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#3168FF", background: "#E2F0F9", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>1</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0B202E" }}>Proactive Guidance</div>
              </div>
              <p className="text-slate" style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>Keeps your prep on track by identifying weak spots and auto-generating scenarios before the real thing.</p>
            </div>
          </div>

          {/* CARD 2: Adapts to Feedback (unchanged) */}
          <div className="how-card">
            <div className="visual-area">
              <div className="memory-vault">
                <div className="scan-bar-enhanced"></div>
                <div className="memory-tag" data-tag="0"><span style={{color: '#3168FF', display: 'flex'}}><Icons.Sparkle /></span> Focus on System Design</div>
                <div className="memory-tag" data-tag="1" style={{ marginLeft: '20px' }}><span style={{color: '#3168FF', display: 'flex'}}><Icons.Sparkle /></span> Adopt stricter persona</div>
                <div className="memory-tag" data-tag="2" style={{ opacity: 0.5 }}><span style={{color: '#8C9CA8', display: 'flex'}}><Icons.Sparkle /></span> Ask for complexity</div>
                <div className="saving-indicator" id="savingIndicator"></div>
              </div>
            </div>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#3168FF", background: "#E2F0F9", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>2</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0B202E" }}>Adapts to Feedback</div>
              </div>
              <p className="text-slate" style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>Memories are saved across all sessions to adjust difficulty, tone, and technical focus automatically.</p>
            </div>
          </div>

          {/* CARD 3: Omnipresent Platform (unchanged) */}
          <div className="how-card">
            <div className="visual-area">
              <div className="network-circle" style={{ position: "relative" }}>
                <div className="rotating-border"></div>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div 
                    className="central-ai" 
                    style={{ color: '#3168FF', display: 'flex', animation: 'float 3s infinite', cursor: 'pointer' }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      for (let i = 0; i < 12; i++) {
                        const particle = document.createElement('div');
                        particle.className = 'particle';
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 20 + Math.random() * 50;
                        const dx = Math.cos(angle) * distance;
                        const dy = Math.sin(angle) * distance;
                        particle.style.setProperty('--dx', dx + 'px');
                        particle.style.setProperty('--dy', dy + 'px');
                        particle.style.left = rect.left + rect.width/2 + 'px';
                        particle.style.top = rect.top + rect.height/2 + 'px';
                        document.body.appendChild(particle);
                        setTimeout(() => particle.remove(), 1000);
                      }
                    }}
                  >
                    <Icons.AI />
                  </div>
                </div>
                <div className="orbit-node">
                  <div className="node"><Icons.Database /></div>
                </div>
                <div className="orbit-node">
                  <div className="node"><Icons.Mic /></div>
                </div>
                <div className="orbit-node">
                  <div className="node"><Icons.Device /></div>
                </div>
              </div>
            </div>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#3168FF", background: "#E2F0F9", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>3</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0B202E" }}>Omnipresent Platform</div>
              </div>
              <p className="text-slate" style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>Practice anywhere. Voice mode on your phone during a walk, or deep architectural design on desktop.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Script for Card 2: sequential tag pulses and saving indicator */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const tags = document.querySelectorAll('.memory-tag');
            const savingIndicator = document.getElementById('savingIndicator');
            let tagIndex = 0;

            function pulseNextTag() {
              if (tags.length === 0) return;
              tags.forEach(t => t.classList.remove('active-pulse'));
              tags[tagIndex].classList.add('active-pulse');
              if (savingIndicator) {
                savingIndicator.classList.add('show');
                setTimeout(() => savingIndicator.classList.remove('show'), 800);
              }
              tagIndex = (tagIndex + 1) % tags.length;
            }

            setInterval(pulseNextTag, 2800);
          })();
        `
      }} />
    </section>
  );
}