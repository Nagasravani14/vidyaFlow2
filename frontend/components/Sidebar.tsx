"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard,
  BookOpen,
  GitFork,
  BotMessageSquare,
  Sparkles,
  Award,
  BarChart3,
  FileText,
  Video,
  Layers,
  GraduationCap,
  Users,
  HeartHandshake,
  LogOut,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  currentRole?: "student" | "teacher" | "parent";
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  badge?: string;
}

// Gentle Web Audio API sound generator (Zero external audio asset dependencies)
function playComicSound(type: "hover" | "click") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "hover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch {
    // Audio context may be restricted by browser policy prior to gesture
  }
}

export default function Sidebar({ currentRole = "student" }: SidebarProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Initialize theme from localStorage or document class
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem("vf_theme");
    if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const storedSound = localStorage.getItem("vf_sound_enabled");
    if (storedSound !== null) {
      setSoundEnabled(storedSound === "true");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vf_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vf_theme", "light");
    }
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem("vf_sound_enabled", String(nextSound));
  };

  const studentNavItems: NavItem[] = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, emoji: "🕸️" },
    { label: "Multiverse Learning", href: "/student/learning", icon: BookOpen, emoji: "🕷️", badge: "ACTIVE" },
    { label: "Concept Map", href: "/student/concept-map", icon: GitFork, emoji: "🧠" },
    { label: "AI Coach", href: "/student/coach", icon: BotMessageSquare, emoji: "🤖", badge: "AI 2.0" },
    { label: "Practice", href: "/student/quiz?mode=adaptive", icon: Sparkles, emoji: "⚡" },
    { label: "Tests", href: "/student/quiz?mode=diagnostic", icon: Layers, emoji: "🎯" },
    { label: "Notes & Summaries", href: "/student/notes", icon: FileText, emoji: "📖" },
    { label: "Videos", href: "/student/videos", icon: Video, emoji: "🎥" },
    { label: "Progress", href: "/student/progress", icon: BarChart3, emoji: "📊" },
    { label: "Achievements", href: "/student/achievements", icon: Award, emoji: "🏆" },
  ];

  const teacherNavItems: NavItem[] = [
    { label: "Class Overview", href: "/teacher/dashboard", icon: LayoutDashboard, emoji: "🕸️" },
    { label: "AI Interventions", href: "/teacher/dashboard#interventions", icon: Sparkles, emoji: "🤖" },
    { label: "Student Insights", href: "/teacher/dashboard#students", icon: Users, emoji: "👥" },
    { label: "Curriculum Map", href: "/student/concept-map", icon: GitFork, emoji: "🧠" },
  ];

  const parentNavItems: NavItem[] = [
    { label: "Child Overview", href: "/parent/dashboard", icon: HeartHandshake, emoji: "🕸️" },
    { label: "Weekly Insights", href: "/parent/dashboard#insights", icon: Sparkles, emoji: "📊" },
    { label: "Teacher Updates", href: "/parent/dashboard#updates", icon: BookOpen, emoji: "📖" },
    { label: "Test Schedule", href: "/parent/dashboard#tests", icon: Layers, emoji: "🎯" },
  ];

  const navItems =
    currentRole === "teacher"
      ? teacherNavItems
      : currentRole === "parent"
      ? parentNavItems
      : studentNavItems;

  const roleBadge = {
    student: {
      text: "Student Portal",
      emoji: "🕷️",
      color: "from-rose-500/20 via-sky-500/20 to-cyan-500/20 text-rose-600 dark:text-cyan-300 border-rose-500/30 dark:border-cyan-500/30",
    },
    teacher: {
      text: "Teacher Portal",
      emoji: "👨‍🏫",
      color: "from-purple-500/20 via-pink-500/20 to-rose-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    },
    parent: {
      text: "Parent Portal",
      emoji: "👨‍👩‍👧",
      color: "from-emerald-500/20 via-teal-500/20 to-sky-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    },
  }[currentRole];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-3 border-b border-slate-200/80 dark:border-white/10">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-sky-600 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-300 text-white font-bold text-lg">
              🕷️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-rose-500 via-sky-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                  VidyaFlow
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30">
                  CINEMATIC
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                MULTIVERSE LEARNING
              </p>
            </div>
          </Link>

          {/* Audio effect toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              aria-label="Toggle audio effects"
              title={soundEnabled ? "Mute comic sound effects" : "Enable comic sound effects"}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-sky-400/50 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Role Pill Indicator */}
        <div className="px-1 mb-4">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between bg-gradient-to-r ${roleBadge.color} shadow-sm backdrop-blur-sm`}
          >
            <span className="flex items-center gap-1.5">
              <span>{roleBadge.emoji}</span>
              <span>{roleBadge.text}</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Links with Spider-Man Emojis */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href.includes("?") && pathname === item.href.split("?")[0]);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (soundEnabled) playComicSound("click");
                  setMobileOpen(false);
                }}
                onMouseEnter={() => {
                  if (soundEnabled) playComicSound("hover");
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-sky-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent hover:border-slate-300/60 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm select-none shrink-0 transition-transform duration-200 group-hover:scale-125">
                    {item.emoji}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                      {item.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Bottom Utility */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3">
        {/* Role Portal Switcher */}
        <div className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs">
          <p className="font-semibold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
            <span>Switch Role Portal</span>
            <span className="text-[10px] font-mono text-slate-400">HERO MULTIVERSE</span>
          </p>
          <div className="grid grid-cols-3 gap-1">
            <Link
              href="/student/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`text-center py-1.5 rounded-lg text-[11px] font-medium transition ${
                currentRole === "student"
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 shadow-sm"
                  : "hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400"
              }`}
            >
              🕷️ Student
            </Link>
            <Link
              href="/teacher/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`text-center py-1.5 rounded-lg text-[11px] font-medium transition ${
                currentRole === "teacher"
                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 shadow-sm"
                  : "hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400"
              }`}
            >
              👨‍🏫 Teacher
            </Link>
            <Link
              href="/parent/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`text-center py-1.5 rounded-lg text-[11px] font-medium transition ${
                currentRole === "parent"
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400"
              }`}
            >
              👨‍👩‍👧 Parent
            </Link>
          </div>
        </div>

        {/* Exit to Role Landing */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🦸</span>
            <span>Exit to Role Landing</span>
          </div>
          <LogOut className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-sky-600 text-white font-bold text-sm">
            🕷️
          </div>
          <span className="font-extrabold text-sm bg-gradient-to-r from-rose-500 to-sky-400 bg-clip-text text-transparent">
            VIDYAFLOW
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-navy-950 shadow-2xl border-r border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen shrink-0 sticky top-0 bg-white/85 dark:bg-[#070B1F]/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 z-30 transition-colors duration-300">
        {sidebarContent}
      </aside>
    </>
  );
}
