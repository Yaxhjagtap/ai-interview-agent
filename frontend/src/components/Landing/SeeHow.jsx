import React, { useState } from "react";
import SiriWave from "./SiriWave";

// --- 100% PREMIUM UI ICONS ---
const UI = {
  AI: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v3m0 12v3M5 12H2m20 0h-3m-3.46-7.54l-2.12 2.12M7.54 17.46l-2.12 2.12m13.04 0l-2.12-2.12M7.54 6.54L5.42 4.42" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  User: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Send: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Paperclip: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
  ),
  Mic: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  ),
  PhoneOff: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.6 3.6a2 2 0 0 0-2.81 0l-2.4 2.4a1 1 0 0 0-.25.9 15.6 15.6 0 0 0 10.4 10.4 1 1 0 0 0 .9-.25l2.4-2.4a2 2 0 0 0 0-2.81l-2.22-2.22a2 2 0 0 0-2.73-.13l-1.93 1.48a13.3 13.3 0 0 1-3.64-3.64l1.48-1.93a2 2 0 0 0-.13-2.73L10.6 3.6z"></path>
      <line x1="22" y1="2" x2="2" y2="22"></line>
    </svg>
  ),
  VideoOff: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ),
  ScreenShare: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
  ),
  Download: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
};

// --- WRAPPER: MacOS Window Frame ---
const WindowFrame = ({ children, isDark = false, title = "AceIQ" }) => (
  <div className={`os-window ${isDark ? "os-dark" : "os-light"}`}>
    <div className="os-header">
      <div className="os-title">{title}</div>
      <div className="os-spacer"></div>
    </div>
    <div className="os-body">{children}</div>
  </div>
);

// --- 1. CHAT UI (Hyper-Realistic) ---
function CardAsk() {
  return (
    <WindowFrame title="AceIQ Copilot">
      <div className="chat-app">
        <div className="chat-canvas">
          <div className="chat-msg user-msg msg-1">
            <div className="msg-bubble user-bubble">
              What's the best approach to designing a global rate limiter?
            </div>
          </div>

          {/* Typing Indicator replaces itself with the actual message */}
          <div className="chat-msg ai-msg type-anim">
            <div className="msg-avatar ai-bg">
              <UI.AI />
            </div>
            <div className="msg-bubble ai-bubble typing-box">
              <span className="t-dot"></span>
              <span className="t-dot"></span>
              <span className="t-dot"></span>
            </div>
          </div>

          <div className="chat-msg ai-msg msg-2">
            <div className="msg-avatar ai-bg">
              <UI.AI />
            </div>
            <div className="msg-bubble ai-bubble">
              For a global scale, <strong>Token Bucket (Redis + Lua script)</strong> is highly optimal because it prevents race conditions and handles burst traffic efficiently across regions.
            </div>
          </div>

          <div className="chat-msg user-msg msg-3">
            <div className="msg-bubble user-bubble">
              Got it. Which would you pick for an API Gateway integration?
            </div>
          </div>
        </div>

        {/* Realistic Input Field */}
        <div className="chat-input-area">
          <div className="chat-input-box">
            <button className="icon-btn">
              <UI.Paperclip />
            </button>
            <div className="chat-placeholder">Reply to Copilot...</div>
            <button className="icon-btn">
              <UI.Mic />
            </button>
            <button className="send-btn">
              <UI.Send />
            </button>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

// --- 2. VOICE CALL UI (Zoom/Discord Style) ---
function CardAct() {
  return (
    <WindowFrame title="Live Mock Session" isDark={true}>
      <div className="voice-app">
        <div className="v-top-bar">
         
       
        </div>

        <div className="v-stage">
          <div className="v-avatar-wrapper">
            <div className="v-avatar-glow"></div>
            <div className="v-avatar-core">
              <UI.AI />
            </div>
          </div>
          <div className="v-wave-box">
            <SiriWave
              height={60}
              colors={["#3168FF", "#11B4F8", "#ffffff"]}
              speed={0.03}
              amp={0.8}
            />
          </div>
        </div>

        <div className="v-captions">
          <div className="v-caption-box">
            <span className="v-caption-text">
              "Let's move to the data model. How would you handle race conditions when updating the token count concurrently?"
            </span>
            <span className="v-cursor"></span>
          </div>
        </div>

        <div className="v-controls">
          <button className="v-btn v-btn-active">
            <UI.Mic />
          </button>
          <button className="v-btn v-btn-off">
            <UI.VideoOff />
          </button>
          <button className="v-btn v-btn-off">
            <UI.ScreenShare />
          </button>
          <button className="v-btn v-btn-danger">
            <UI.PhoneOff />
          </button>
        </div>
      </div>
    </WindowFrame>
  );
}

// --- 3. ANALYTICS DASHBOARD (Vercel Style) ---
function CardAnticipate() {
  const metrics = [
    { name: "Architecture", score: 88, delta: "+26%" },
    { name: "Communication", score: 76, delta: "+8%" },
    { name: "Edge Cases", score: 94, delta: "+14%" },
  ];

  return (
    <WindowFrame title="Session Diagnostics">
      <div className="dash-app">
        <div className="dash-header">
          <div>
            <h4 className="dash-title">Performance Overview</h4>
            <p className="dash-subtitle">System Design • Level 5</p>
          </div>
          <button className="export-btn">
            <UI.Download /> Export
          </button>
        </div>

        <div className="dash-grid">
          {metrics.map((m, i) => (
            <div key={m.name} className={`d-card d-anim-${i}`}>
              <div className="d-card-top">
                <span className="d-name">{m.name}</span>
                <span className="d-delta">{m.delta}</span>
              </div>
              <div className="d-score">
                {m.score}
                <span className="d-max">/100</span>
              </div>
              <div className="d-progress-bg">
                <div
                  className="d-progress-fill"
                  style={{ "--target": `${m.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-insight d-anim-3">
          <div className="d-insight-top">
            <div className="d-icon-bg">
              <UI.AI />
            </div>
            <span className="d-insight-title">Copilot Insight</span>
          </div>
          <p className="d-insight-text">
            Excellent improvement on edge case identification. Next session, focus on articulating database sharding strategies earlier to avoid scaling bottlenecks.
          </p>
        </div>
      </div>
    </WindowFrame>
  );
}

// --- MAIN CONFIG ---
const TABS_CONFIG = [
  {
    title: "Ask",
    heading: "Tell it what to\ndo. It's done.",
    desc: "Ask for a specific algorithm hint or system design concept. The AI processes it instantly, just like chatting with a senior engineer.",
    card: <CardAsk />,
  },
  {
    title: "Act",
    heading: "Practice live.\nGet feedback.",
    desc: "Engage in ultra-realistic voice mock interviews. The AI dynamically adapts to your answers and pushes you to defend your choices.",
    card: <CardAct />,
  },
  {
    title: "Anticipate",
    heading: "Know your flaws\nbefore they do.",
    desc: "Get incredibly detailed, matrix-driven analytics after every session. We track your clarity, depth, and confidence over time.",
    card: <CardAnticipate />,
  },
];

export default function SeeHow() {
  const [active, setActive] = useState(1);
  const curr = TABS_CONFIG[active];

  return (
    <section
      id="features"
      style={{
        padding: "0 clamp(20px, 4vw, 60px) 120px",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          /* Smooth Tab Switching */
          @keyframes slideFadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade { animation: slideFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-ui { animation: slideFadeIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

          /* MacOS Window Frame */
          .os-window {
            width: 100%;
            height: 500px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(11, 32, 46, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
          }
          .os-light { background: #ffffff; }
          .os-dark { background: #0F172A; border: 1px solid #1E293B; }

          .os-header {
            height: 40px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            z-index: 10;
          }
          .os-dark .os-header { background: #1E293B; border-bottom-color: #334155; }
          .os-light .os-header { background: #F8FAFC; }

          .os-title { flex: 1; text-align: center; font-size: 0.8rem; font-weight: 600; color: #64748B; letter-spacing: 0.02em; }
          .os-spacer { width: 60px; }
          .os-body { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; }

          /* =========================================
             1. CHAT APP CSS
             ========================================= */
          .chat-app { flex: 1; display: flex; flex-direction: column; background: #ffffff; }
          .chat-canvas { flex: 1; padding: 24px; display: flex; flex-direction: column; justify-content: flex-end; gap: 20px; }

          .chat-msg { display: flex; gap: 12px; opacity: 0; transform: translateY(10px); animation: chatPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          @keyframes chatPop { to { opacity: 1; transform: translateY(0); } }

          .user-msg { align-self: flex-end; flex-direction: row-reverse; }
          .ai-msg { align-self: flex-start; }

          .msg-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .ai-bg { background: linear-gradient(135deg, #3168FF, #11B4F8); color: white; box-shadow: 0 4px 12px rgba(49,104,255,0.2); }

          .msg-bubble { padding: 14px 18px; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; font-weight: 500; max-width: 280px; }
          .user-bubble { background: #F1F5F9; color: #0F172A; border-bottom-right-radius: 4px; }
          .ai-bubble { background: #ffffff; color: #0F172A; border: 1px solid #E2E8F0; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }

          /* Sequence Timing */
          .msg-1 { animation-delay: 0.2s; }

          /* Typing indicator logic */
          @keyframes hideType { to { opacity: 0; display: none; position: absolute; } }
          .type-anim { animation: chatPop 0.4s 1s forwards, hideType 0s 2.8s forwards; }
          .typing-box { display: flex; gap: 4px; align-items: center; height: 48px; }
          .t-dot { width: 6px; height: 6px; background: #94A3B8; border-radius: 50%; animation: tBounce 1.4s infinite ease-in-out both; }
          .t-dot:nth-child(1) { animation-delay: -0.32s; }
          .t-dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes tBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

          .msg-2 { animation-delay: 2.8s; }
          .msg-3 { animation-delay: 5s; }

          /* Realistic Input Bar */
          .chat-input-area { padding: 16px 24px 24px; background: #ffffff; border-top: 1px solid #F1F5F9; }
          .chat-input-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; height: 48px; display: flex; align-items: center; padding: 0 6px; gap: 8px; transition: border 0.2s; }
          .chat-input-box:hover { border-color: #CBD5E1; }
          .icon-btn { background: none; border: none; color: #64748B; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; }
          .icon-btn:hover { background: #E2E8F0; color: #0F172A; }
          .chat-placeholder { flex: 1; color: #94A3B8; font-size: 0.95rem; font-weight: 500; cursor: text; padding-left: 8px; }
          .send-btn { background: #0B202E; color: white; width: 36px; height: 36px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

          /* =========================================
             2. VOICE APP CSS
             ========================================= */
          .voice-app { flex: 1; display: flex; flex-direction: column; }

          .v-top-bar { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
          .v-encryption { font-size: 0.75rem; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .v-timer { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: #fff; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 20px; }
          .red-pulse { width: 8px; height: 8px; background: #EF4444; border-radius: 50%; animation: rPulse 2s infinite; }
          @keyframes rPulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 70% { box-shadow: 0 0 0 6px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }

          .v-stage { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; padding: 0 16px; }
          .v-avatar-wrapper { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
          .v-avatar-glow { position: absolute; inset: -20px; background: linear-gradient(135deg, #3168FF, #11B4F8); border-radius: 50%; filter: blur(30px); opacity: 0.4; animation: orbBreathe 4s ease-in-out infinite alternate; }
          .v-avatar-core { position: relative; width: 80px; height: 80px; background: #1E293B; border: 2px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #11B4F8; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); z-index: 2; }
          @keyframes orbBreathe { to { transform: scale(1.2); opacity: 0.7; } }
          .v-wave-box { width: 100%; height: 60px; opacity: 0.7; }

          /* Live Captions */
          .v-captions { padding: 0 24px 20px; }
          .v-caption-box { background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); padding: 16px 20px; border-radius: 12px; }
          .v-caption-text { display: inline-block; font-size: 1rem; color: #F8FAFC; line-height: 1.5; font-weight: 500; font-style: italic; clip-path: inset(0 100% 0 0); animation: typeLine 4s 0.5s linear forwards; }
          .v-cursor { display: inline-block; width: 2px; height: 1em; background: #11B4F8; vertical-align: middle; margin-left: 4px; animation: blinkCur 1s infinite; }
          @keyframes typeLine { to { clip-path: inset(0 0 0 0); } }
          @keyframes blinkCur { 50% { opacity: 0; } }

          .v-controls { display: flex; justify-content: center; gap: 16px; padding: 20px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px); }
          .v-btn { width: 52px; height: 52px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: white; flex-shrink: 0; }
          .v-btn-active { background: rgba(255,255,255,0.15); }
          .v-btn-off { background: rgba(255,255,255,0.05); color: #94A3B8; }
          .v-btn-danger { background: #EF4444; }
          .v-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }

          /* =========================================
             3. DASHBOARD APP CSS
             ========================================= */
          .dash-app { flex: 1; background: #FAFAFA; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

          .dash-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
          .dash-title { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0F172A; }
          .dash-subtitle { margin: 4px 0 0 0; font-size: 0.85rem; color: #64748B; font-weight: 500; }
          .export-btn { background: #ffffff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; color: #0F172A; display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); flex-shrink: 0; }

          .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .d-card { background: #ffffff; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); opacity: 0; transform: translateY(15px); animation: chatPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

          /* Sequence Grid Loading */
          .d-anim-0 { animation-delay: 0.2s; }
          .d-anim-1 { animation-delay: 0.35s; }
          .d-anim-2 { animation-delay: 0.5s; }
          .d-anim-3 { animation-delay: 0.9s; }

          .d-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
          .d-name { font-size: 0.85rem; font-weight: 600; color: #64748B; }
          .d-delta { font-size: 0.75rem; font-weight: 700; color: #10B981; background: #D1FAE5; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
          .d-score { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
          .d-max { font-size: 0.9rem; color: #94A3B8; font-weight: 600; }

          .d-progress-bg { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
          .d-progress-fill { height: 100%; background: linear-gradient(90deg, #3168FF, #11B4F8); width: 0; animation: fillAnim 1s 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fillAnim { to { width: var(--target); } }

          .d-insight { background: #ffffff; border: 1px solid #E2E8F0; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); opacity: 0; transform: translateY(15px); animation: chatPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .d-insight-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
          .d-icon-bg { width: 28px; height: 28px; background: #EFF6FF; color: #3168FF; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .d-icon-bg svg { width: 16px; height: 16px; }
          .d-insight-title { font-size: 0.9rem; font-weight: 700; color: #1E293B; }
          .d-insight-text { margin: 0; font-size: 0.95rem; line-height: 1.6; color: #475569; font-weight: 500; }

          /* Core Layout */
          .tab-btn-local {
            flex: 1;
            text-align: center;
            padding: 16px 0;
            font-size: 1.1rem;
            font-weight: 700;
            color: #8C9CA8;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
          }
          .tab-btn-local:hover { color: #405869; }
          .tab-btn-local.active { color: #0B202E; border-bottom-color: #3168FF; }

          /* Responsive Improvements */
          @media (max-width: 1024px) {
            .os-window { height: auto; min-height: 500px; }
            .dash-grid { gap: 14px; }
            .msg-bubble { max-width: 240px; }
          }

          @media (max-width: 900px) {
            .mob-col {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
              margin-top: 44px !important;
            }

            .tab-container {
              max-width: 100% !important;
            }

            .tab-btn-local {
              font-size: 1rem;
              padding: 14px 0;
            }

            .dash-grid {
              grid-template-columns: 1fr;
            }

            .dash-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .export-btn {
              width: fit-content;
            }

            .v-stage {
              padding: 0 12px;
            }
          }

          @media (max-width: 768px) {
            section#features {
              padding-left: 16px !important;
              padding-right: 16px !important;
              padding-bottom: 80px !important;
            }

            .os-window {
              height: auto;
              min-height: 0;
              border-radius: 14px;
            }

            .os-header {
              padding: 0 12px;
            }

            .os-title {
              font-size: 0.76rem;
            }

            .chat-canvas {
              padding: 18px 16px;
              gap: 16px;
            }

            .msg-bubble {
              max-width: min(78vw, 320px);
              font-size: 0.92rem;
              padding: 12px 14px;
            }

            .chat-input-area {
              padding: 14px 16px 16px;
            }

            .chat-placeholder {
              font-size: 0.9rem;
            }

            .v-top-bar {
              padding: 16px 16px 12px;
              flex-wrap: wrap;
            }

            .v-encryption {
              font-size: 0.7rem;
            }

            .v-avatar-wrapper {
              width: 88px;
              height: 88px;
              margin-bottom: 16px;
            }

            .v-avatar-core {
              width: 72px;
              height: 72px;
            }

            .v-wave-box {
              height: 52px;
            }

            .v-captions {
              padding: 0 16px 16px;
            }

            .v-caption-box {
              padding: 14px 16px;
            }

            .v-caption-text {
              font-size: 0.92rem;
            }

            .v-controls {
              gap: 12px;
              padding: 16px;
              flex-wrap: wrap;
            }

            .v-btn {
              width: 48px;
              height: 48px;
            }

            .dash-app {
              padding: 18px 16px;
              gap: 16px;
            }

            .dash-title {
              font-size: 1.05rem;
            }

            .dash-subtitle {
              font-size: 0.8rem;
            }

            .d-card {
              padding: 14px;
            }

            .d-score {
              font-size: 1.45rem;
            }

            .d-insight {
              padding: 16px;
            }

            .d-insight-text {
              font-size: 0.92rem;
            }
          }

          @media (max-width: 640px) {
            .tab-container {
              display: flex;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              white-space: nowrap;
            }

            .tab-container::-webkit-scrollbar {
              display: none;
            }

            .tab-btn-local {
              flex: 1 0 auto;
              min-width: 33.33%;
              font-size: 0.95rem;
            }

            .chat-msg {
              gap: 10px;
            }

            .msg-avatar {
              width: 30px;
              height: 30px;
            }

            .typing-box {
              height: 44px;
            }

            .v-timer {
              font-size: 0.8rem;
              padding: 5px 10px;
            }
          }

          @media (max-width: 480px) {
            .os-header {
              height: 38px;
            }

            .os-spacer {
              width: 52px;
            }

            .chat-canvas {
              padding: 14px 12px;
            }

            .msg-bubble {
              max-width: 84vw;
              padding: 11px 13px;
              border-radius: 14px;
            }

            .chat-input-box {
              height: 44px;
              gap: 6px;
            }

            .icon-btn,
            .send-btn {
              width: 34px;
              height: 34px;
            }

            .chat-placeholder {
              font-size: 0.86rem;
              padding-left: 6px;
            }

            .v-caption-text {
              font-size: 0.88rem;
            }

            .dash-grid {
              gap: 12px;
            }

            .export-btn {
              padding: 8px 12px;
              font-size: 0.82rem;
            }

            .d-name {
              font-size: 0.82rem;
            }

            .d-delta {
              font-size: 0.72rem;
            }

            .d-score {
              font-size: 1.35rem;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2
          className="sr"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            textAlign: "center",
            color: "#0B202E",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            paddingTop: "120px",
          }}
        >
          See how AceIQ can
          <br />
          streamline your prep.
        </h2>

    {/* Animated bounce arrow - seamless connection */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "40px",
  }}
>
  {/* Upper gradient line */}
  <div
    style={{
      width: "2px",
      height: "60px",
      background: "linear-gradient(to bottom, transparent, #11B4F8)",
    }}
  />

  {/* Bubble */}
  <div
    className="cyan-bubble"
    style={{
      padding: "8px 24px",
      fontSize: "1.05rem",
      borderRadius: "24px 24px 0 24px",
      position: "relative",
      zIndex: 2,                     // bubble covers the overlapping line
    }}
  >
    hey
  </div>

  {/* Animated group: lower line + arrow, pulled up into the bubble */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      animation: "arrowBounce 2s infinite",
      marginTop: "-12px",            // overlaps the bubble’s bottom
      position: "relative",
      zIndex: 1,                     // stays behind the bubble
    }}
  >
    {/* Lower connecting line */}
    <div
      style={{
        width: "2px",
        height: "40px",
        background: "#11B4F8",
      }}
    />
    {/* Arrow */}
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#11B4F8"
      strokeWidth="3"
      style={{ display: "block" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </div>
</div>

        {/* Tab Selection */}
        <div
          className="tab-container"
          style={{
            maxWidth: "800px",
            borderBottom: "2px solid #F0ECE4",
            margin: "40px auto 0",
          }}
        >
          {TABS_CONFIG.map((t, i) => (
            <button
              key={t.title}
              onClick={() => setActive(i)}
              className={`tab-btn-local ${active === i ? "active" : ""}`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40fr 60fr",
            gap: "80px",
            alignItems: "center",
            marginTop: "80px",
          }}
          className="mob-col"
        >
          <div className="animate-fade" key={`content-${active}`}>
            <h3
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                color: "#0B202E",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                marginBottom: "24px",
                whiteSpace: "pre-line",
              }}
            >
              {curr.heading}
            </h3>
            <p
              className="text-slate"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.65,
                fontWeight: 500,
                margin: 0,
              }}
            >
              {curr.desc}
            </p>
          </div>

          <div className="animate-ui" key={`card-${active}`}>
            {curr.card}
          </div>
        </div>
      </div>
    </section>
  );
}