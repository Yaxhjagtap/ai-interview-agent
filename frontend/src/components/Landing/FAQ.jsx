import React, { useState } from "react";

const FAQ_DATA = [
  {
    q: "How does the AI evaluate my technical answers?",
    a: "AceIQ uses a fine-tuned deployment of deep learning models trained specifically on tens of thousands of real technical interviews. It evaluates your answers across strict dimensions: architectural depth, edge case identification, scalability concerns, and communication clarity. Every evaluation generates a matrix-driven rubric breakdown."
  },
  {
    q: "Can I practice for specific companies?",
    a: "Yes. You can configure the interviewer persona to mimic the specific rubrics of top-tier companies (e.g., Google's intense focus on distributed systems, Amazon's integration of Leadership Principles, or Meta's rapid execution style). We continuously update our playbooks based on recent, verified interview loops."
  },
  {
    q: "Is my voice data and resume kept private?",
    a: "Absolutely. We employ enterprise-grade AES-256 encryption and adhere to strict zero-retention policies for free-tier users. Your voice data is processed ephemerally during the live session and is never used to train generalized public models. You own your data."
  },
  {
    q: "Does it support frontend, backend, or machine learning roles?",
    a: "Yes, AceIQ supports a highly diverse set of engineering domains. From React performance optimization and CSS rendering paths to MLOps, deep learning deployment, and distributed backend scaling, the inference engine adapts dynamically to your specified target role."
  },
  {
    q: "What happens if I get stuck during a mock interview?",
    a: "Our AI is explicitly prompted to act like a collaborative, senior human interviewer. If you freeze, it will not simply give you the answer. Instead, it provides contextual hints, asks guiding sub-questions, and helps you arrive at the solution organically."
  },
  {
    q: "Do I need to download any software?",
    a: "No. AceIQ runs entirely in the browser using the native Web Audio API and WebGL for rendering. It works flawlessly on Chrome, Safari, and Edge across both desktop and mobile devices without any third-party plugins."
  },
  {
    q: "How accurate is the system design feedback?",
    a: "Remarkably accurate. The AI is trained to evaluate standard architectural patterns (CAP theorem tradeoffs, database sharding, caching). It will penalize you if you ignore constraints like latency, read/write ratios, or fail to define API contracts clearly."
  }
];

// Premium SVG Plus/Minus Icon
const AccordionIcon = ({ isOpen }) => (
  <div style={{ 
    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', 
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </div>
);

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" style={{ padding: "120px clamp(20px, 5vw, 60px)", background: "#ffffff" }}>
      
      {/* 🎬 THE FAQ CSS ENGINE 🎬 */}
      <style>
        {`
          .faq-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .faq-item-v2 {
            border-bottom: 1px solid #F1F5F9;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .faq-question-v2 {
            padding: 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            font-size: 1.15rem;
            font-weight: 700;
            color: #0B202E;
            transition: color 0.3s ease;
          }
          .faq-item-v2:hover .faq-question-v2 {
            color: #3168FF;
          }

          .faq-icon-box {
            width: 36px; height: 36px;
            border-radius: 50%;
            background: #F8FAFC;
            display: flex; align-items: center; justify-content: center;
            color: #64748B;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
          .faq-item-v2.active .faq-icon-box {
            background: rgba(49, 104, 255, 0.1);
            color: #3168FF;
          }

          /* Smooth Height Transition Logic */
          .faq-answer-wrapper {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }
          .faq-item-v2.active .faq-answer-wrapper {
            grid-template-rows: 1fr;
          }

          .faq-answer-v2 {
            min-height: 0;
            font-size: 0.95rem;
            line-height: 1.7;
            color: #64748B;
            font-weight: 500;
          }
          .faq-answer-inner {
            padding-bottom: 24px;
          }

          /* --- MOBILE RESPONSIVENESS --- */
          @media (max-width: 768px) {
            .faq-question-v2 {
              font-size: 1rem;
              padding: 20px 0;
            }
            .faq-answer-v2 {
              font-size: 0.85rem;
            }
            .faq-icon-box {
              width: 32px; height: 32px;
            }
          }
        `}
      </style>

      <div className="faq-container">
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ 
            fontSize: "0.75rem", 
            fontWeight: 800, 
            color: "#916A28", 
            letterSpacing: "0.2em", 
            textTransform: "uppercase",
            marginBottom: "16px" 
          }}>
            Support Center
          </p>
          <h2 style={{ 
            fontSize: "clamp(2rem, 5vw, 3.2rem)", 
            fontWeight: 900, 
            color: "#0B202E", 
            letterSpacing: "-0.04em", 
            lineHeight: 1.1 
          }}>
            Frequently Asked Questions
          </h2>
        </div>

        {/* ACCORDION LIST */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className={`faq-item-v2 ${isOpen ? 'active' : ''}`}
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              >
                <div className="faq-question-v2">
                  <span>{faq.q}</span>
                  <div className="faq-icon-box">
                    <AccordionIcon isOpen={isOpen} />
                  </div>
                </div>
                
                <div className="faq-answer-wrapper">
                  <div className="faq-answer-v2">
                    <div className="faq-answer-inner">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div style={{ 
          marginTop: "64px", 
          textAlign: "center", 
          padding: "32px", 
          background: "#F8FAFC", 
          borderRadius: "24px",
          border: "1px solid #F1F5F9" 
        }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748B", fontWeight: 600 }}>
            Still have questions? <span style={{ color: "#3168FF", cursor: "pointer", marginLeft: "4px" }}>Contact our engineering team →</span>
          </p>
        </div>

      </div>
    </section>
  );
}