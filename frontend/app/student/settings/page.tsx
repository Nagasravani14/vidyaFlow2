"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Sliders,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  Award,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bell,
} from "lucide-react";

export default function StudentSettingsPage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [board, setBoard] = useState<string>("telangana");
  const [language, setLanguage] = useState<string>("en");
  const [dailyTarget, setDailyTarget] = useState<number>(250);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem("vf_theme");
    setIsDark(storedTheme !== "light");

    const storedSound = localStorage.getItem("vf_sound_enabled");
    setSoundEnabled(storedSound !== "false");
  }, []);

  const handleToggleTheme = (mode: "dark" | "light") => {
    const nextDark = mode === "dark";
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vf_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vf_theme", "light");
    }
    triggerSaved();
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("vf_sound_enabled", String(enabled));
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Settings">⚙️</span>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Spider HUD Settings
              </h1>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize your superhero dashboard, audio feedback, curriculum, and AI Coach preferences.
            </p>
          </div>

          {savedToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences Saved</span>
            </div>
          )}
        </div>

        {/* Visual Environment / Theme */}
        <div className="spider-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-spider-red-500/10 text-spider-red-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Visual Environment
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between Spider Noir Dark Mode and Day Edition Light Mode.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleToggleTheme("dark")}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                isDark
                  ? "border-spider-cyan-400 bg-navy-900/90 text-white shadow-neon-cyan ring-1 ring-spider-cyan-400/50"
                  : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <div className="p-2 rounded-lg bg-navy-800 text-spider-cyan-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Spider Noir Dark Mode</p>
                <p className="text-[11px] text-slate-400 font-mono">Midnight navy, neon cyan & red HUD</p>
              </div>
            </button>

            <button
              onClick={() => handleToggleTheme("light")}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                !isDark
                  ? "border-spider-blue-500 bg-white text-slate-900 shadow-md ring-1 ring-spider-blue-500"
                  : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Daily Bugle Light Mode</p>
                <p className="text-[11px] text-slate-400 font-mono">Crisp daylight paper with cobalt accents</p>
              </div>
            </button>
          </div>
        </div>

        {/* Audio Effects */}
        <div className="spider-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-spider-blue-500/10 text-spider-blue-500">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Comic Web Audio Feedback
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subtle synthesized web shooter ticks and button pulses via Web Audio API.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggleSound(!soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                soundEnabled
                  ? "bg-spider-blue-500 text-white shadow-neon-cyan"
                  : "bg-slate-200 dark:bg-white/10 text-slate-500"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? "Enabled" : "Muted"}</span>
            </button>
          </div>
        </div>

        {/* Curriculum & Board */}
        <div className="spider-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Curriculum Board
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aligns textbook chapters, syllabus mind maps, and quiz questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { id: "telangana", label: "Telangana SCERT", note: "Classes 6-10 State Board Textbook Series" },
              { id: "icse", label: "ICSE Board", note: "Council for the Indian School Certificate Exam" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBoard(b.id);
                  triggerSaved();
                }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  board === b.id
                    ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold ring-1 ring-purple-500/40"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">{b.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.note}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Coach Preferred Language */}
        <div className="spider-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Spider AI Coach Default Language
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the language your AI Mentor speaks when answering questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { code: "en", label: "English", sub: "Global English" },
              { code: "te", label: "తెలుగు (Telugu)", sub: "Telangana SCERT Native" },
              { code: "hi", label: "हिन्दी (Hindi)", sub: "National Standard" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  triggerSaved();
                }}
                className={`p-3 rounded-xl border text-center transition ${
                  language === lang.code
                    ? "border-amber-500 bg-amber-500/10 text-amber-500 font-bold ring-1 ring-amber-500/40"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">{lang.label}</p>
                <p className="text-[10px] text-slate-400">{lang.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Mission XP Goal */}
        <div className="spider-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Mission XP Target
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Number of experience points to keep your hero streak active.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { xp: 100, label: "Casual Hero", note: "15 mins/day" },
              { xp: 250, label: "Active Web Cadet", note: "30 mins/day" },
              { xp: 500, label: "Multiverse Master", note: "60 mins/day" },
            ].map((tier) => (
              <button
                key={tier.xp}
                onClick={() => {
                  setDailyTarget(tier.xp);
                  triggerSaved();
                }}
                className={`p-3 rounded-xl border text-center transition ${
                  dailyTarget === tier.xp
                    ? "border-rose-500 bg-rose-500/10 text-rose-500 font-bold ring-1 ring-rose-500/40"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">{tier.xp} XP</p>
                <p className="text-[11px] font-semibold text-rose-500">{tier.label}</p>
                <p className="text-[10px] text-slate-400">{tier.note}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
