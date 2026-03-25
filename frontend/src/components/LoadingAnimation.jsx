import React, { useEffect, useRef } from "react";

const PARTICLE_CONFIG = {
  MAX_PARTICLES: 100,
  COLORS: ["#3168FF", "#11B4F8", "#93c5fd", "#7c3aed", "#ffffff"],
  BASE_SIZE: 1.6,
  SIZE_VARIANCE: 3,
  BASE_SPEED_Y: -0.7,
  SPEED_VARIANCE_Y: 1.6,
  DRIFT_X: 1.4,
  DECAY_RATE: 0.012,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

class Sparkle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.reset(true);
  }

  reset(initial = false) {
    this.x = this.w / 2 + randomBetween(-80, 80);
    this.y = this.h / 2 + randomBetween(-30, 40);

    this.size =
      PARTICLE_CONFIG.BASE_SIZE +
      Math.random() * PARTICLE_CONFIG.SIZE_VARIANCE;

    this.life = initial ? randomBetween(0, 100) : 0;
    this.maxLife = randomBetween(90, 130);

    this.vx = randomBetween(-PARTICLE_CONFIG.DRIFT_X, PARTICLE_CONFIG.DRIFT_X);
    this.vy =
      PARTICLE_CONFIG.BASE_SPEED_Y -
      Math.random() * PARTICLE_CONFIG.SPEED_VARIANCE_Y;

    this.color =
      PARTICLE_CONFIG.COLORS[
        Math.floor(Math.random() * PARTICLE_CONFIG.COLORS.length)
      ];

    this.opacity = 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = randomBetween(-0.07, 0.07);
    this.shape = Math.random() > 0.5 ? "star" : "circle";
  }

  update(w, h) {
    const cx = w / 2;
    const cy = h / 2;

    const dx = cx - this.x;
    const dy = cy - this.y;

    this.vx += dx * 0.00025;
    this.vy += dy * 0.00025;

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    this.life += PARTICLE_CONFIG.DECAY_RATE * 100;

    const progress = Math.min(this.life / this.maxLife, 1);
    this.opacity = Math.sin(progress * Math.PI);

    this.vx *= 0.985;
    this.vy *= 0.985;

    if (this.life >= this.maxLife || this.opacity <= 0.01) {
      this.reset();
      this.x = cx + randomBetween(-90, 90);
      this.y = cy + randomBetween(-40, 50);
    }
  }

  draw(ctx) {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    if (this.shape === "circle") {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
      grad.addColorStop(0, this.color);
      grad.addColorStop(0.5, `${this.color}cc`);
      grad.addColorStop(1, "transparent");

      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowBlur = 16;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(0, -this.size * 1.3);
        ctx.rotate(Math.PI / 4);
        ctx.lineTo(0, -this.size * 0.2);
        ctx.rotate(Math.PI / 4);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

export default function LoadingAnimation({
  width = "100%",
  height = "100%",
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      particles.current = Array.from(
        { length: PARTICLE_CONFIG.MAX_PARTICLES },
        () => new Sparkle(rect.width, rect.height)
      );
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // Clear the canvas completely to ensure a transparent background
      ctx.clearRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      particles.current.forEach((p) => {
        p.update(W, H);
        p.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    init();
    render();

    const handleResize = () => {
      resize();
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        display: "block",
        // Remove the solid background color to allow the parent's background to show through
        background: "transparent",
      }}
    />
  );
}