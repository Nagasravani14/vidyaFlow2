"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SpiderNavButton, { NavButtonConfig } from "./SpiderNavButton";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Sliders,
  Zap,
} from "lucide-react";

interface SidebarProps {
  currentRole?: "student" | "teacher" | "parent";
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

  // The 12 Cinematic Spider-Verse Navigation Buttons
  const navItems: NavButtonConfig[] = [
    {
      id: "cmd-center",
      label: "Spider Command Center",
      tagline: "Dashboard & Daily Missions",
      href: "/student/dashboard",
      emoji: "🕷️",
      variant: "dashboard",
    },
    {
      id: "learning",
      label: "Multiverse Learning",
      tagline: "SCERT & ICSE Textbooks",
      href: "/student/learning",
      emoji: "🕸️",
      badge: "ACTIVE",
      variant: "learn",
    },
    {
      id: "concept-map",
      label: "Web of Knowledge",
      tagline: "Prerequisite Mind Map",
      href: "/student/concept-map",
      emoji: "🧠",
      variant: "map",
    },
    {
      id: "ai-coach",
      label: "Spider AI Coach",
      tagline: "Socratic Mentor & Bot",
      href: "/student/coach",
      emoji: "🦸",
      badge: "AI 2.0",
      variant: "coach",
    },
    {
      id: "practice",
      label: "Danger Room Practice",
      tagline: "Adaptive Skill Drilling",
      href: "/student/quiz?mode=adaptive",
      emoji: "⚡",
      variant: "practice",
    },
    {
      id: "tests",
      label: "Hero Diagnostic Tests",
      tagline: "Benchmarking & Gaps",
      href: "/student/quiz?mode=diagnostic",
      emoji: "🎯",
      variant: "tests",
    },
    {
      id: "notes",
      label: "Secret Archives",
      tagline: "Revision Notes & Cheats",
      href: "/student/notes",
      emoji: "📖",
      variant: "notes",
    },
    {
      id: "videos",
      label: "Multiverse Cinema",
      tagline: "Animated Visual Lessons",
      href: "/student/videos",
      emoji: "🎥",
      variant: "videos",
    },
    {
      id: "progress",
      label: "Hero Journey",
      tagline: "BKT Mastery & Analytics",
      href: "/student/progress",
      emoji: "📊",
      variant: "progress",
    },
    {
      id: "achievements",
      label: "Spider Trophy Room",
      tagline: "Badges, XP & Streaks",
      href: "/student/achievements",
      emoji: "🏆",
      variant: "achievements",
    },
    {
      id: "teacher-portal",
      label: "Web-Watch Tower",
      tagline: "Educator Interventions",
      href: "/teacher/dashboard",
      emoji: "👨‍🏫",
      variant: "teacher",
    },
    {
      id: "parent-portal",
      label: "Spider Alliance",
      tagline: "Parental Insight Hub",
      href: "/parent/dashboard",
      emoji: "👨‍👩‍👧",
      variant: "parent",
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      <div>
        {/* Brand Header with Spider-Verse styling */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-spider-red-600 via-purple-700 to-spider-blue-600 shadow-md shadow-spider-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl" role="img" aria-label="Spider">🕷️</span>
              {/* Halftone ring */}
              <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-spider-red-500 via-spider-blue-400 to-spider-cyan-400 bg-clip-text text-transparent">
                  VIDYAFLOW
                </span>
                <span className="rounded bg-spider-red-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-spider-red-500 border border-spider-red-500/30">
                  V2
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                SPIDER-VERSE HUD
              </p>
            </div>
          </Link>

          {/* Theme & Sound Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute Comic Sounds" : "Enable Comic Sounds"}
              aria-label={soundEnabled ? "Mute Comic Sounds" : "Enable Comic Sounds"}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-spider-blue-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Level & XP Micro-Card */}
        <div className="mb-3 rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-r from-spider-red-500/10 via-indigo-600/5 to-spider-blue-500/10 p-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-spider-cyan-400 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                Hero Ananya (Cadet)
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-spider-red-500 dark:text-spider-red-400">
              LVL 8
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 transition-all duration-500"
              style={{ width: "72.5%" }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-400 mt-1 font-mono">
            <span>1,450 / 2,000 XP</span>
            <span className="text-amber-500 font-bold">🔥 5-Day Streak</span>
          </div>
        </div>

        {/* 12 Spider-Verse Navigation Buttons List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isExact = pathname === item.href;
            const isSubPath =
              item.href !== "/" &&
              pathname.startsWith(item.href.split("?")[0]) &&
              (!item.href.includes("?") || pathname.includes(item.href.split("?")[1]));
            const isActive = isExact || isSubPath;

            return (
              <SpiderNavButton
                key={item.id}
                item={item}
                isActive={isActive}
                soundEnabled={soundEnabled}
                onClick={() => setMobileOpen(false)}
              />
            );
          })}
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 space-y-1.5 mt-3">
        <Link
          href="/student/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            pathname === "/student/settings"
              ? "bg-spider-blue-500/15 text-spider-blue-500 border border-spider-blue-500/30"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Spider HUD Settings</span>
        </Link>

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit to Role Landing</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Hamburger Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-spider-red-600 to-spider-blue-600 text-white font-bold text-xs">
            🕷️
          </div>
          <span className="font-extrabold text-sm bg-gradient-to-r from-spider-red-500 to-spider-blue-400 bg-clip-text text-transparent">
            VIDYAFLOW
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 z-30 transition-colors">
        {sidebarContent}
      </aside>
    </>
  );
}
