import React from "react";
import { Link } from "react-router-dom";

export default function BottomCTA() {
  return (
    <section 
      style={{ 
        background: "#ffffff", 
        padding: "100px 20px",
        display: "flex",
        justifyContent: "center", 
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <style>
        {`
          /* Keyframe for golden wave movement (smooth linear) */
          @keyframes goldenWaveFlow {
            0% {
              background-position: 0% 0%, 0% 0%, 0% 0%;
            }
            100% {
              background-position: 200% 0%, 100% 0%, 300% 0%;
            }
          }
          
          /* Keyframe for button shimmer (unchanged) */
          @keyframes shimmerGlow {
            0% {
              transform: translateX(-100%) skewX(-15deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateX(200%) skewX(-15deg);
              opacity: 0;
            }
          }
          
          .glass-card-container {
            position: relative;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            border-radius: clamp(24px, 5vw, 40px);
            padding: clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px);
            text-align: center;
            overflow: hidden; 
            
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            
            /* Internal inset borders – no external glow */
            box-shadow: 
              0 0 0 1px rgba(255, 245, 200, 0.3) inset,
              0 0 0 2px rgba(255, 215, 120, 0.2);
            
            transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          }
          
          /* Golden waves background */
          .glass-card-container::before {
            content: '';
            position: absolute;
            top: -20%;
            left: 0;
            width: 200%;
            height: 140%;
            background: 
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(255, 215, 80, 0.2) 50px,
                rgba(255, 215, 80, 0.2) 80px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 80px,
                rgba(255, 200, 60, 0.15) 80px,
                rgba(255, 200, 60, 0.15) 120px
              ),
              radial-gradient(circle at 30% 50%, rgba(188, 142, 45, 0.12), transparent 70%);
            background-blend-mode: overlay;
            background-repeat: repeat-x;
            background-size: 200% 100%, 300% 100%, 100% 100%;
            animation: goldenWaveFlow 20s linear infinite;
            pointer-events: none;
            z-index: 0;
            border-radius: inherit;
            opacity: 0.8;
          }
          
          .glass-card-container:hover {
            transform: translateY(-6px);
            box-shadow: 
              0 0 0 1px rgba(255, 245, 200, 0.5) inset,
              0 0 0 3px rgba(255, 215, 120, 0.4);
            backdrop-filter: blur(28px);
          }
          
          .glass-card-container:hover::before {
            animation-duration: 16s; /* slightly faster on hover */
            opacity: 0.95;
          }
          
          .glass-content {
            position: relative;
            z-index: 1;
          }
          
          /* Button shimmer effect (unchanged) */
          .glow-button {
            position: relative;
            overflow: hidden;
            display: inline-flex;
            background: #0B202E;
            color: #ffffff;
            padding: 16px 40px;
            border-radius: 999px;
            font-size: 1.05rem;
            font-weight: 800;
            text-decoration: none;
            transition: transform 0.2s;
          }
          
          .glow-button::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(120deg, 
              transparent, 
              rgba(255, 235, 140, 0.5), 
              rgba(255, 225, 100, 0.8), 
              rgba(255, 215, 80, 0.6), 
              transparent);
            transform: translateX(-100%) skewX(-15deg);
            transition: none;
            pointer-events: none;
          }
          
          .glow-button:hover {
            transform: translateY(-2px);
          }
          
          .glow-button:hover::after {
            animation: shimmerGlow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}
      </style>
      
      <div className="glass-card-container">
        <div className="glass-content">
          <h2 
            className="sr" 
            style={{ 
              fontSize: "clamp(2.2rem, 6vw, 4rem)", 
              fontWeight: 900, 
              letterSpacing: "-0.04em", 
              lineHeight: 1.1, 
              color: "#0B202E", 
              marginBottom: "20px" 
            }}
          >
            Think better.<br/>Interview better with AI.
          </h2>
          <p 
            className="sr" 
            style={{ 
              fontSize: "clamp(1rem, 4vw, 1.2rem)", 
              color: "#405869", 
              lineHeight: 1.6, 
              marginBottom: "40px", 
              maxWidth: "600px", 
              margin: "0 auto 40px", 
              fontWeight: 600 
            }}
          >
            Never miss a practice session, a key insight, or your dream job offer. Join engineers leveling up today.
          </p>
          <Link 
            to="/register" 
            className="glow-button"
          >
            Start your free practice
          </Link>
        </div>
      </div>
    </section>
  );
}