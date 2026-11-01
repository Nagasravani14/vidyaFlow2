"use client";

import { useEffect, useRef, useState } from "react";

interface SpiderBackgroundProps {
  intensity?: "full" | "subtle" | "minimal";
  interactive?: boolean;
}

export default function SpiderBackground({
  intensity = "full",
  interactive = true,
}: SpiderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Sync theme
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
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

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse coordinates for interactive web tension
    const mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle nodes for interconnected spider web network
    const nodeCount = intensity === "minimal" ? 16 : intensity === "subtle" ? 28 : 42;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      colorType: "red" | "blue" | "cyan";
      pulse: number;
      pulseSpeed: number;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.2,
        colorType: i % 3 === 0 ? "red" : i % 3 === 1 ? "blue" : "cyan",
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Atmospheric floating motes / sparks
    const moteCount = intensity === "minimal" ? 12 : 25;
    const motes: Array<{
      x: number;
      y: number;
      vy: number;
      size: number;
      opacity: number;
      drift: number;
    }> = [];

    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -0.2 - Math.random() * 0.4,
        size: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 2,
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Colors adapted to theme
      const colors = isDark
        ? {
            webRed: "rgba(244, 63, 94, ",
            webBlue: "rgba(56, 189, 248, ",
            webCyan: "rgba(34, 211, 238, ",
            particleRed: "rgba(244, 63, 94, 0.85)",
            particleBlue: "rgba(56, 189, 248, 0.85)",
            particleCyan: "rgba(34, 211, 238, 0.9)",
            mote: "rgba(224, 242, 254, ",
            beaconRed: "#f43f5e",
            beaconCyan: "#22d3ee",
          }
        : {
            webRed: "rgba(225, 29, 72, ",
            webBlue: "rgba(2, 132, 199, ",
            webCyan: "rgba(6, 182, 212, ",
            particleRed: "rgba(225, 29, 72, 0.6)",
            particleBlue: "rgba(2, 132, 199, 0.6)",
            particleCyan: "rgba(6, 182, 212, 0.7)",
            mote: "rgba(14, 165, 233, ",
            beaconRed: "#e11d48",
            beaconCyan: "#0284c7",
          };

      // 1. Draw interconnected spider web strands between close nodes
      const maxDistance = width > 768 ? 160 : 110;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Move node
        if (!prefersReducedMotion) {
          n1.x += n1.vx;
          n1.y += n1.vy;
          n1.pulse += n1.pulseSpeed;

          // Boundary bounce
          if (n1.x < 0 || n1.x > width) n1.vx *= -1;
          if (n1.y < 0 || n1.y > height) n1.vy *= -1;

          // Subtle pull toward mouse tension if nearby
          if (mouse.active) {
            const dx = mouse.x - n1.x;
            const dy = mouse.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180 && dist > 20) {
              const force = (180 - dist) / 180;
              n1.x += (dx / dist) * force * 0.8;
              n1.y += (dy / dist) * force * 0.8;
            }
          }
        }

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.2);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            // Alternating web color palette
            if ((i + j) % 3 === 0) {
              ctx.strokeStyle = `${colors.webRed}${alpha})`;
            } else if ((i + j) % 3 === 1) {
              ctx.strokeStyle = `${colors.webBlue}${alpha})`;
            } else {
              ctx.strokeStyle = `${colors.webCyan}${alpha})`;
            }

            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Draw node center
        const pSize = n1.radius + Math.sin(n1.pulse) * 0.6;
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, Math.max(0.5, pSize), 0, Math.PI * 2);
        if (n1.colorType === "red") {
          ctx.fillStyle = colors.particleRed;
          if (isDark) ctx.shadowColor = "#f43f5e";
        } else if (n1.colorType === "blue") {
          ctx.fillStyle = colors.particleBlue;
          if (isDark) ctx.shadowColor = "#38bdf8";
        } else {
          ctx.fillStyle = colors.particleCyan;
          if (isDark) ctx.shadowColor = "#22d3ee";
        }
        ctx.shadowBlur = isDark ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw atmospheric floating motes / comic sparks
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (!prefersReducedMotion) {
          m.y += m.vy;
          m.x += Math.sin(tick * 0.02 + m.drift) * 0.3;
          if (m.y < -10) {
            m.y = height + 10;
            m.x = Math.random() * width;
          }
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.mote}${m.opacity})`;
        ctx.fill();
      }

      // 3. Subtle cinematic light streak
      if (!prefersReducedMotion && tick % 360 < 60) {
        const streakAlpha =
          Math.sin((tick % 360) * (Math.PI / 60)) * (isDark ? 0.08 : 0.04);
        const grad = ctx.createLinearGradient(0, height * 0.6, width, height * 0.6);
        grad.addColorStop(0, "rgba(244, 63, 94, 0)");
        grad.addColorStop(0.3, `rgba(244, 63, 94, ${streakAlpha})`);
        grad.addColorStop(0.7, `rgba(56, 189, 248, ${streakAlpha})`);
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, height * 0.59, width, 2);
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark, intensity, interactive]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Atmospheric Ambient Lighting Gradients */}
      <div
        className={`absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-[140px] transition-opacity duration-700 ${
          isDark ? "bg-spider-red-600/15" : "bg-spider-red-500/10"
        }`}
      />
      <div
        className={`absolute top-1/4 -right-32 h-[600px] w-[600px] rounded-full blur-[160px] transition-opacity duration-700 ${
          isDark ? "bg-spider-blue-600/15" : "bg-spider-blue-500/10"
        }`}
      />
      <div
        className={`absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full blur-[150px] transition-opacity duration-700 ${
          isDark ? "bg-spider-cyan-500/10" : "bg-indigo-500/10"
        }`}
      />

      {/* 2. Comic Halftone Pattern Layer */}
      <div className="halftone-pattern absolute inset-0 opacity-40 pointer-events-none" />

      {/* 3. Subtle Cyber Skyline Silhouette at Base */}
      <svg
        className={`absolute bottom-0 left-0 right-0 w-full transition-opacity duration-500 pointer-events-none ${
          isDark ? "opacity-35" : "opacity-15"
        }`}
        height="180"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path
          className={isDark ? "text-navy-950" : "text-slate-300"}
          d="M0,180 L0,110 L45,110 L45,85 L80,85 L80,110 L120,110 L120,60 L150,60 L150,110 L190,110 L190,40 L210,40 L210,110 L260,110 L260,70 L300,70 L300,110 L350,110 L350,30 L370,30 L370,110 L430,110 L430,55 L470,55 L470,110 L520,110 L520,80 L560,80 L560,110 L620,110 L620,20 L640,20 L640,110 L700,110 L700,65 L740,65 L740,110 L800,110 L800,45 L825,45 L825,110 L890,110 L890,75 L930,75 L930,110 L990,110 L990,25 L1010,25 L1010,110 L1070,110 L1070,60 L1110,60 L1110,110 L1170,110 L1170,35 L1190,35 L1190,110 L1250,110 L1250,75 L1290,75 L1290,110 L1350,110 L1350,50 L1380,50 L1380,110 L1440,110 L1440,180 Z"
        />
        {/* Antennas with blinking lights */}
        <line x1="200" y1="40" x2="200" y2="15" stroke={isDark ? "#f43f5e" : "#e11d48"} strokeWidth="2" />
        <circle cx="200" cy="15" r="3" fill="#f43f5e" className="animate-pulse" />
        <line x1="630" y1="20" x2="630" y2="5" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
        <circle cx="630" cy="5" r="3" fill="#38bdf8" className="animate-pulse" />
        <line x1="1000" y1="25" x2="1000" y2="10" stroke={isDark ? "#f43f5e" : "#e11d48"} strokeWidth="2" />
        <circle cx="1000" cy="10" r="3" fill="#f43f5e" className="animate-pulse" />
        <line x1="1180" y1="35" x2="1180" y2="15" stroke={isDark ? "#22d3ee" : "#06b6d4"} strokeWidth="2" />
        <circle cx="1180" cy="15" r="3" fill="#22d3ee" className="animate-pulse" />
      </svg>

      {/* 4. Canvas Animated Interactive Spider Web & Particles Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90 pointer-events-none"
      />

      {/* 5. Geometric Spider Corner Web (Top Right Accent) */}
      <svg
        className={`absolute top-0 right-0 h-48 w-48 transition-opacity duration-500 pointer-events-none ${
          isDark ? "opacity-25" : "opacity-15"
        }`}
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M200,0 L0,200 M200,50 L50,200 M200,100 L100,200 M200,150 L150,200"
          stroke={isDark ? "#38bdf8" : "#0284c7"}
          strokeWidth="0.8"
        />
        <path
          d="M200,0 Q120,40 40,200 M200,30 Q140,80 80,200 M200,70 Q160,120 120,200 M200,120 Q180,160 160,200"
          stroke={isDark ? "#f43f5e" : "#e11d48"}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
