import React from "react";

// Curated list of the absolute top-tier companies for maximum impact
const TOP_COMPANIES = [
  { name: "Google", slug: "google" },
  { name: "Meta", slug: "meta" },
  { name: "Stripe", slug: "stripe" },
  { name: "OpenAI", slug: "openai" },
  { name: "Amazon", slug: "amazon" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Netflix", slug: "netflix" },
  { name: "Databricks", slug: "databricks" }
];

export default function LogoStrip() {
  return (
    <div style={{ width: "100%", background: "#ffffff", paddingTop: "50px" }}>
      <style>
        {`
          .trust-root {
            width: 100%;
            background: #ffffff;
            border-top: 1px solid #F3F1EF;
            border-bottom: 1px solid #F3F1EF;
            /* Reduced padding from 60px to 40px since the label is no longer inside taking up space */
            padding: 40px 0; 
            user-select: none;
            overflow: hidden;
          }

          .trust-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .trust-label {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.85rem; /* ✨ Reduced font size ✨ */
            color: #916A28;
            font-weight: 600; /* ✨ Slightly bolder to maintain readability at smaller size ✨ */
            text-transform: uppercase;
            letter-spacing: 0.18em; /* ✨ Increased text width/spacing slightly ✨ */
            text-align: center;
            margin: 0 0 32px 0; 
            padding: 0 20px;
          }

          .trust-viewport {
            width: 100%;
            overflow: hidden;
            position: relative;
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }

          .trust-track {
            display: flex;
            width: max-content;
            animation: trust-scroll 35s linear infinite;
            align-items: center;
          }

          .trust-track:hover {
            animation-play-state: paused;
          }

          .trust-item {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 45px;
            cursor: default;
          }

          .trust-icon {
            height: 26px;
            width: auto;
            filter: grayscale(1) brightness(0) opacity(0.25);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: block;
          }

          .trust-item:hover .trust-icon {
            filter: grayscale(0) brightness(0.2) opacity(1);
            transform: scale(1.1);
          }

          @keyframes trust-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          @media (max-width: 768px) {
            .trust-root {
              padding: 30px 0;
            }
            .trust-container {
              padding: 0 20px;
            }
            .trust-label {
              font-size: 0.75rem; /* ✨ Smaller on mobile ✨ */
              letter-spacing: 0.15em; /* ✨ Adjusted width for mobile ✨ */
              margin-bottom: 24px;
            }
            .trust-item {
              padding: 0 30px;
            }
            .trust-icon {
              height: 20px;
            }
          }
        `}
      </style>

      {/* 1. Label is now completely outside and above the strip border */}
      <p className="trust-label">Want Company specific interviews to land your dream job ?  </p>

      {/* 2. The border container begins here */}
      <section className="trust-root">
        <div className="trust-container">
          <div className="trust-viewport">
            <div className="trust-track">
              {[...TOP_COMPANIES, ...TOP_COMPANIES, ...TOP_COMPANIES].map((company, idx) => (
                <div key={idx} className="trust-item">
                  <img
                    src={`https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${company.slug}.svg`}
                    alt={`${company.name} logo`}
                    className="trust-icon"
                    draggable="false"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}