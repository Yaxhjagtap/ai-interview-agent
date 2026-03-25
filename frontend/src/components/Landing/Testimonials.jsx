import React, { useState, useEffect } from "react";

const TESTIMONIALS_DATA = [
  {
    quote: "At the top of my favorites, it’s literally my most trusted coach, my closest technical partner, and then AceIQ. That says it all.",
    name: "PRIYA SHARMA", role: "GOOGLE L5", initial: "P", color: "linear-gradient(135deg, #3168FF, #11B4F8)"
  },
  {
    quote: "I walked into my Meta system design round genuinely confident for the first time in my career. The mock sessions adapt dynamically, making them indistinguishable from the real thing.",
    name: "JAMES OKAFOR", role: "META E5", initial: "J", color: "linear-gradient(135deg, #10A37F, #0E8E6D)"
  },
  {
    quote: "The voice feedback caught communication patterns I had no idea I had. My clarity score jumped 19 points in two weeks. I secured the Amazon offer within a month.",
    name: "SOFIA REYES", role: "AMAZON SDE II", initial: "S", color: "linear-gradient(135deg, #FF9900, #E68A00)"
  },
  {
    quote: "It doesn't just ask questions; it pushes back on weak assumptions. It actively trained me to defend my architectural decisions under immense pressure.",
    name: "ALEX CHEN", role: "STRIPE L3", initial: "A", color: "linear-gradient(135deg, #6366F1, #4F46E5)"
  },
  {
    quote: "As a self-taught developer, passing the technical screen at Netflix felt impossible. AceIQ's rigorous algorithmic feedback loop bridged that gap completely.",
    name: "MARCUS WEBB", role: "NETFLIX SENIOR UI", initial: "M", color: "linear-gradient(135deg, #E50914, #B20710)"
  }
];

// Star Rating Component for Enhancement
const Stars = () => (
  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '20px' }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const activeQuote = TESTIMONIALS_DATA[idx];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section id="testimonials" style={{ padding: "0 clamp(20px, 4vw, 60px) 120px", background: "#ffffff" }}>
      <style>
        {`
          @keyframes quoteSwap {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: quoteSwap 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .testimonial-card {
            background: linear-gradient(180deg, #F9FBFC 0%, #ffffff 100%);
            border-radius: 32px;
            padding: 60px 30px;
            position: relative;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 15px 50px -10px rgba(0,0,0,0.03);
            min-height: 380px; /* Reduced Card Height */
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: all 0.3s ease;
          }

          /* Mobile Tweaks */
          @media (max-width: 768px) {
            .testimonial-card {
              padding: 40px 20px;
              min-height: 340px;
              border-radius: 24px;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        
        {/* Smaller Label */}
        <p style={{ 
          fontSize: "0.75rem", 
          fontWeight: 800, 
          color: "#916A28", 
          letterSpacing: "0.15em", 
          textTransform: "uppercase",
          marginBottom: "16px"
        }}>
          Wall of Love
        </p>
        
        {/* Smaller Heading */}
        <h2 style={{ 
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)", 
          fontWeight: 800, 
          color: "#0B202E", 
          letterSpacing: "-0.03em", 
          lineHeight: 1.15, 
          margin: "0 auto 50px",
          maxWidth: "700px"
        }}>
          It’s like having a Staff Engineer<br/>Surrounding yourself
        </h2>

        <div 
          className="testimonial-card" 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Stars />

          <div style={{ minHeight: "120px", display: "flex", alignItems: "center" }}>
            <p key={idx} className="animate-fade-in" style={{ 
              fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)", 
              fontWeight: 500, 
              color: "#0B202E", 
              lineHeight: 1.6, 
              maxWidth: "700px", 
              margin: "0 auto", 
              fontStyle: "italic"
            }}>
              "{activeQuote.quote}"
            </p>
          </div>

          {/* Author Section */}
          <div className="animate-fade-in" key={`author-${idx}`} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "12px", 
            marginTop: "32px" 
          }}>
            <div style={{ 
              width: "56px", 
              height: "56px", 
              borderRadius: "50%", 
              background: activeQuote.color, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#fff", 
              fontSize: "1.2rem", 
              fontWeight: 800, 
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)" 
            }}>
              {activeQuote.initial}
            </div>
            <div style={{ 
              fontSize: "0.8rem", 
              fontWeight: 800, 
              color: "#405869", 
              letterSpacing: "0.05em", 
              textTransform: "uppercase" 
            }}>
              {activeQuote.name} <span style={{ opacity: 0.5, fontWeight: 500 }}>• {activeQuote.role}</span>
            </div>
          </div>
        </div>

        {/* Smaller Pagination Dots */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "32px" }}>
          {TESTIMONIALS_DATA.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIdx(i)} 
              style={{ 
                width: i === idx ? "24px" : "8px", 
                height: "8px", 
                borderRadius: "4px", 
                background: i === idx ? "#3168FF" : "#E5E0D8", 
                border: "none", 
                cursor: "pointer", 
                transition: "all 0.3s ease", 
                padding: 0 
              }} 
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}