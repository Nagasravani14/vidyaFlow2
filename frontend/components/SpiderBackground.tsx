"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface SpiderBackgroundProps {
  intensity?: "full" | "subtle" | "minimal";
  interactive?: boolean;
}

export default function SpiderBackground({
  intensity = "full",
  interactive = true,
}: SpiderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync theme with document element class & themechange custom event
  useEffect(() => {
    setMounted(true);
    const updateTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("themechange", updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", updateTheme);
    };
  }, []);

  // Desktop gentle parallax effect
  useEffect(() => {
    if (!interactive || typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (e.clientX - centerX) / centerX;
      const offsetY = (e.clientY - centerY) / centerY;

      setParallaxOffset({
        x: offsetX * 7,
        y: offsetY * 7,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  // Unified Particle System for BOTH Themes (50-80 floating dots)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 65 floating particles (fits strict 50-80 requirement)
    const particleCount = intensity === "minimal" ? 50 : intensity === "subtle" ? 60 : 70;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      colorIndex: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.35,
        size: Math.random() * 2.2 + 0.8,
        colorIndex: i % 4, // 0, 1, 2, 3
        opacity: Math.random() * 0.6 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.035,
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Render theme-based floating dots with subtle twinkling
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(tick * 0.015 + i) * 0.2;
          p.y += p.vy;
          p.pulse += p.pulseSpeed;

          // Wrap around top or bottom
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          } else if (p.y > height + 10) {
            p.y = -10;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const alpha = Math.sin(p.pulse) * 0.25 + p.opacity * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isDark) {
          // DARK MODE PALETTE: cyan, electric blue, violet, white
          if (p.colorIndex === 0) {
            ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.shadowColor = "#22d3ee";
          } else if (p.colorIndex === 1) {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.shadowColor = "#38bdf8";
          } else if (p.colorIndex === 2) {
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.shadowColor = "#a855f7";
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            ctx.shadowColor = "#ffffff";
          }
          ctx.shadowBlur = 7;
        } else {
          // LIGHT MODE PALETTE: sky blue, soft cyan, pale indigo, white
          if (p.colorIndex === 0) {
            ctx.fillStyle = `rgba(14, 165, 233, ${alpha * 0.85})`;
            ctx.shadowColor = "rgba(14, 165, 233, 0.4)";
          } else if (p.colorIndex === 1) {
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.85})`;
            ctx.shadowColor = "rgba(6, 182, 212, 0.4)";
          } else if (p.colorIndex === 2) {
            ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.8})`;
            ctx.shadowColor = "rgba(99, 102, 241, 0.35)";
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          }
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Dark Mode only: occasional flowing light pulse along web lines
      if (isDark && !prefersReducedMotion && tick % 240 < 40) {
        const pulseRatio = (tick % 240) / 40;
        const beamX = width * 0.35 + pulseRatio * (width * 0.3);
        const beamY = height * 0.45 + Math.sin(pulseRatio * Math.PI) * 20;

        ctx.beginPath();
        ctx.arc(beamX, beamY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 211, 238, 0.85)";
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark, intensity]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ============================================================== */}
      {/* 1. DARK MODE BACKGROUND: Cinematic Spider-Man Universe Image   */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${
          isDark ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          transform: `scale(1.05) translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
          willChange: "transform",
        }}
      >
        <Image
          src="/assets/spider-math-city.jpg"
          alt="Spider-Man Mathematical City Universe"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-vf-cinematic-zoom"
          quality={95}
        />
        {/* Dark Mode Overlays for Superior Content Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050818]/85 via-[#070B1F]/70 to-[#050818]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050818]/80 via-transparent to-[#050818]/80" />

        {/* Dark Mode Atmospheric Neon Lighting */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-[600px] h-[600px] bg-sky-500/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Dark Mode Subtle Mathematical Web Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="200" x2="600" y2="400" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="4 8" />
          <line x1="150" y1="100" x2="600" y2="400" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 6" />
          <line x1="0" y1="500" x2="600" y2="400" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="5 7" />
          <circle cx="600" cy="400" r="4" fill="#22d3ee" className="animate-ping opacity-60" />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* 2. LIGHT MODE BACKGROUND: Futuristic Daylight Learning City     */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${
          !isDark ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          transform: `scale(1.03) translate3d(${parallaxOffset.x * 0.6}px, ${parallaxOffset.y * 0.6}px, 0)`,
          willChange: "transform",
        }}
      >
        <Image
          src="/assets/daylight-city.jpg"
          alt="Futuristic Daylight Learning City"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={95}
        />
        {/* Soft Sky Blue and Cloud White Overlays for Crisp Card & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/70 via-white/55 to-sky-100/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/60 via-transparent to-sky-100/60" />

        {/* Gentle Morning Atmosphere Ambient Glows (Sky Blue, Pale Cyan & Soft Violet) */}
        <div className="absolute -top-16 left-1/3 w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -right-16 w-[450px] h-[450px] bg-indigo-200/25 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-[400px] h-[400px] bg-cyan-200/20 rounded-full blur-[130px] pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 3. UNIFIED ANIMATED DOTS CANVAS: Layered in BOTH Themes       */}
      {/* ============================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-10"
      />
    </div>
  );
}
