import React, { useEffect, useRef } from "react";

export default function SiriWave({ 
  height = 80, 
  // Added an extra color to increase depth
  colors = ["#3168FF", "#11B4F8", "#4285F4", "#93c5fd"], 
  // Drastically slowed down for a calm, premium "thinking" state
  speed = 0.004, 
  amp = 0.6 
}) {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const cv = ref.current; 
    if (!cv) return;

    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => { 
      cv.width = cv.offsetWidth * dpr; 
      cv.height = cv.offsetHeight * dpr; 
      ctx.scale(dpr, dpr); 
    };
    
    resize(); 
    window.addEventListener("resize", resize);

    // Wave Configuration: First wave is the bright 'core', others are 'auras'
    const ws = colors.map((c, i) => ({ 
      c, 
      f: 1.2 + (i * 0.4),               // Frequency: How many peaks/valleys
      a: amp * (1 - i * 0.15),          // Amplitude: Decreases slightly for background waves
      ph: (i * Math.PI) / 2.5,          // Phase offset to separate the waves
      lw: i === 0 ? 2.5 : 1.2,          // Line width: thick core, thin auras
      blur: i === 0 ? 8 : 4             // Glow radius
    }));

    const draw = () => {
      const W = cv.offsetWidth;
      const H = cv.offsetHeight; 
      
      ctx.clearRect(0, 0, W, H);
      
      ws.forEach((w) => {
        ctx.beginPath(); 
        ctx.lineWidth = w.lw;
        
        // --- REALISTIC GLOW EFFECT ---
        ctx.shadowBlur = w.blur;
        ctx.shadowColor = w.c;
        ctx.strokeStyle = w.c + "E6"; // E6 adds slight transparency to the stroke
        
        for (let x = 0; x <= W; x++) {
          const progress = x / W;
          
          // --- CENTER ATTENUATION (The "Pinch") ---
          // This forces the wave to be 0 at the edges and naturally bulge in the center
          // Math.pow(..., 3) creates a very smooth, natural bell-curve shape
          const attenuation = Math.pow(Math.sin(progress * Math.PI), 3);
          
          const tt = progress * Math.PI * 2 * w.f;
          const time = t.current * speed;
          
          // --- FLUID HARMONICS ---
          // Using 3 overlaid sine waves running at different speeds to create organic, non-repeating movement
          const yOffset = 
            Math.sin(tt + time * 15 + w.ph) * 0.5 + 
            Math.sin(tt * 1.5 + time * 8 + w.ph * 1.3) * 0.3 + 
            Math.sin(tt * 0.5 + time * 20 + w.ph * 0.8) * 0.2;
            
          const y = (H / 2) + yOffset * (H * w.a * 0.5) * attenuation;
          
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      
      t.current++; 
      raf.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => { 
      cancelAnimationFrame(raf.current); 
      window.removeEventListener("resize", resize); 
    };
  }, [colors, speed, amp]);

  return <canvas ref={ref} style={{ width: "100%", height, display: "block" }} />;
}