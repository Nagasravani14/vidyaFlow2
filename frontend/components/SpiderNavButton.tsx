"use client";

import Link from "next/link";
import React, { ReactNode } from "react";

export interface NavButtonConfig {
  id: string;
  label: string;
  tagline?: string;
  href: string;
  emoji: string;
  badge?: string;
  variant:
    | "dashboard"
    | "learn"
    | "map"
    | "coach"
    | "practice"
    | "tests"
    | "notes"
    | "videos"
    | "progress"
    | "achievements"
    | "teacher"
    | "parent"
    | "settings";
}

interface SpiderNavButtonProps {
  item: NavButtonConfig;
  isActive: boolean;
  onClick?: () => void;
  soundEnabled?: boolean;
}

// Gentle comic audio synthesizer using Web Audio API (Zero external audio asset dependencies)
function playComicSound(type: "hover" | "click") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "hover") {
      // Gentle web tick / chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else {
      // Crisp web-shooter / comic "thwip" pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Audio context may be restricted by browser policy prior to gesture
  }
}

const VARIANT_STYLES: Record<
  NavButtonConfig["variant"],
  {
    iconBg: string;
    activeBg: string;
    activeBorder: string;
    hoverBorder: string;
    glowColor: string;
    accentDot: string;
  }
> = {
  dashboard: {
    iconBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500/20",
    activeBg: "bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent text-rose-600 dark:text-rose-300",
    activeBorder: "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.35)]",
    hoverBorder: "hover:border-rose-400/40",
    glowColor: "#f43f5e",
    accentDot: "bg-rose-500",
  },
  learn: {
    iconBg: "bg-sky-500/10 text-sky-500 dark:text-sky-400 group-hover:bg-sky-500/20",
    activeBg: "bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-300",
    activeBorder: "border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.35)]",
    hoverBorder: "hover:border-sky-400/40",
    glowColor: "#38bdf8",
    accentDot: "bg-sky-500",
  },
  map: {
    iconBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 group-hover:bg-cyan-500/20",
    activeBg: "bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-600 dark:text-cyan-300",
    activeBorder: "border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.35)]",
    hoverBorder: "hover:border-cyan-400/40",
    glowColor: "#22d3ee",
    accentDot: "bg-cyan-400",
  },
  coach: {
    iconBg: "bg-amber-500/10 text-amber-500 dark:text-amber-400 group-hover:bg-amber-500/20",
    activeBg: "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-300",
    activeBorder: "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
    hoverBorder: "hover:border-amber-400/40",
    glowColor: "#f59e0b",
    accentDot: "bg-amber-400",
  },
  practice: {
    iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500/20",
    activeBg: "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-300",
    activeBorder: "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
    hoverBorder: "hover:border-emerald-400/40",
    glowColor: "#10b981",
    accentDot: "bg-emerald-400",
  },
  tests: {
    iconBg: "bg-violet-500/10 text-violet-500 dark:text-violet-400 group-hover:bg-violet-500/20",
    activeBg: "bg-gradient-to-r from-violet-500/15 via-violet-500/5 to-transparent text-violet-600 dark:text-violet-300",
    activeBorder: "border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]",
    hoverBorder: "hover:border-violet-400/40",
    glowColor: "#8b5cf6",
    accentDot: "bg-violet-400",
  },
  notes: {
    iconBg: "bg-teal-500/10 text-teal-500 dark:text-teal-400 group-hover:bg-teal-500/20",
    activeBg: "bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-transparent text-teal-600 dark:text-teal-300",
    activeBorder: "border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.35)]",
    hoverBorder: "hover:border-teal-400/40",
    glowColor: "#14b8a6",
    accentDot: "bg-teal-400",
  },
  videos: {
    iconBg: "bg-pink-500/10 text-pink-500 dark:text-pink-400 group-hover:bg-pink-500/20",
    activeBg: "bg-gradient-to-r from-pink-500/15 via-pink-500/5 to-transparent text-pink-600 dark:text-pink-300",
    activeBorder: "border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.35)]",
    hoverBorder: "hover:border-pink-400/40",
    glowColor: "#ec4899",
    accentDot: "bg-pink-400",
  },
  progress: {
    iconBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500/20",
    activeBg: "bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-indigo-600 dark:text-indigo-300",
    activeBorder: "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.35)]",
    hoverBorder: "hover:border-indigo-400/40",
    glowColor: "#6366f1",
    accentDot: "bg-indigo-400",
  },
  achievements: {
    iconBg: "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 group-hover:bg-yellow-500/20",
    activeBg: "bg-gradient-to-r from-yellow-500/15 via-yellow-500/5 to-transparent text-yellow-600 dark:text-yellow-300",
    activeBorder: "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.35)]",
    hoverBorder: "hover:border-yellow-400/40",
    glowColor: "#eab308",
    accentDot: "bg-yellow-400",
  },
  teacher: {
    iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500/20",
    activeBg: "bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent text-purple-600 dark:text-purple-300",
    activeBorder: "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]",
    hoverBorder: "hover:border-purple-400/40",
    glowColor: "#a855f7",
    accentDot: "bg-purple-400",
  },
  parent: {
    iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500/20",
    activeBg: "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-300",
    activeBorder: "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
    hoverBorder: "hover:border-emerald-400/40",
    glowColor: "#10b981",
    accentDot: "bg-emerald-400",
  },
  settings: {
    iconBg: "bg-slate-500/10 text-slate-500 dark:text-slate-400 group-hover:bg-slate-500/20",
    activeBg: "bg-gradient-to-r from-slate-500/15 via-slate-500/5 to-transparent text-slate-600 dark:text-slate-300",
    activeBorder: "border-slate-500/50 shadow-[0_0_15px_rgba(148,163,184,0.35)]",
    hoverBorder: "hover:border-slate-400/40",
    glowColor: "#94a3b8",
    accentDot: "bg-slate-400",
  },
};

export default function SpiderNavButton({
  item,
  isActive,
  onClick,
  soundEnabled = true,
}: SpiderNavButtonProps) {
  const style = VARIANT_STYLES[item.variant] || VARIANT_STYLES.dashboard;

  const handleMouseEnter = () => {
    if (soundEnabled) playComicSound("hover");
  };

  const handleClick = () => {
    if (soundEnabled) playComicSound("click");
    if (onClick) onClick();
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-spider-blue-400 select-none ${
        isActive
          ? `${style.activeBg} ${style.activeBorder}`
          : `border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-white/5 ${style.hoverBorder}`
      }`}
    >
      {/* Active Glowing Left Indicator */}
      {isActive && (
        <span
          className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r ${style.accentDot} shadow-[0_0_10px_${style.glowColor}]`}
        />
      )}

      {/* Emoji / Icon Container with Comic Bubble */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
          isActive
            ? `${style.iconBg} shadow-sm ring-1 ring-white/10`
            : `${style.iconBg}`
        }`}
      >
        <span role="img" aria-hidden="true">
          {item.emoji}
        </span>
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span
            className={`truncate text-xs font-bold tracking-wide transition-colors ${
              isActive
                ? "text-slate-900 dark:text-slate-100 font-extrabold"
                : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
            }`}
          >
            {item.label}
          </span>
          {item.badge && (
            <span className="ml-1.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-spider-red-500/20 text-spider-red-500 border border-spider-red-500/30">
              {item.badge}
            </span>
          )}
        </div>
        {item.tagline && (
          <p className="truncate text-[10px] text-slate-400 dark:text-slate-400 font-mono">
            {item.tagline}
          </p>
        )}
      </div>

      {/* Spider-Web Corner Tick (micro-detail on hover) */}
      <svg
        className={`pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-60 ${
          isActive ? "opacity-80" : ""
        }`}
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
      >
        <path d="M10,0 L0,10 M10,5 L5,10" strokeWidth="0.8" />
      </svg>
    </Link>
  );
}
