"use client";

import React from "react";
import Link from "next/link";
import CinematicIntro, { ReplayIntroButton } from "@/components/CinematicIntro";
import {
  GraduationCap,
  Sparkles,
  Users,
  HeartHandshake,
  ArrowRight,
  GitFork,
  Cpu,
  Layers,
  Zap,
  Shield,
  Compass,
} from "lucide-react";

export default function LandingRoleSelector() {
  const roles = [
    {
      role: "Student",
      title: "Spider Command Center",
      name: "Ananya Sharma",
      tagline: "Class 8A ? Telangana State Board",
      description:
        "Personalized adaptive learning flow, real-time BKT mastery tracking, interactive prerequisite mind maps, and Socratic AI Coach.",
      href: "/student/dashboard",
      icon: GraduationCap,
      emoji: "🕷️",
      color: "from-spider-red-500 to-spider-blue-600",
      accent: "spider-red",
      badge: "ACTIVE LEARNER",
      stats: "78% Math Mastery ? 3 Active Gaps",
    },
    {
      role: "Teacher",
      title: "Web-Watch Tower",
      name: "Mr. R. Sharma",
      tagline: "Mathematics Educator ? Class 8A (32 Students)",
      description:
        "Classroom mastery overview, root-cause gap detection, and actionable AI interventions ('AI Suggests, Teacher Decides').",
      href: "/teacher/dashboard",
      icon: Users,
      emoji: "👨‍🏫",
      color: "from-purple-600 to-indigo-700",
      accent: "purple",
      badge: "EDUCATOR PORTAL",
      stats: "18 Mastered ? 9 Developing ? 5 Needs Support",
    },
    {
      role: "Parent",
      title: "Spider Alliance",
      name: "Rajesh Sharma",
      tagline: "Guardian of Ananya Sharma",
      description:
        "Weekly AI progress insights, subject readiness percentiles, direct teacher correspondence, and upcoming diagnostic test schedules.",
      href: "/parent/dashboard",
      icon: HeartHandshake,
      emoji: "👨‍👩‍👧",
      color: "from-emerald-500 to-teal-700",
      accent: "emerald",
      badge: "PARENT OVERSIGHT",
      stats: "Math 78% ? Science 84% ? English 91%",
    },
  ];

  return (
    <main className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex flex-col justify-between relative overflow-hidden transition-colors">
      {/* Cinematic Spider-Verse Intro Overlay */}
      <CinematicIntro />

      {/* Top Spider-Verse HUD Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-navy-950/70 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-spider-red-600 via-purple-700 to-spider-blue-600 flex items-center justify-center shadow-lg shadow-spider-red-500/25">
              <span className="text-xl" role="img" aria-label="Spider">🕷️</span>
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
                VidyaFlow
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase">
                SPIDER-VERSE ADAPTIVE LEARNING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <ReplayIntroButton />
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hidden sm:inline-flex font-mono text-[11px]">
              Telangana SCERT ? ICSE (Classes 6-10)
            </span>
            <span className="px-3 py-1 rounded-full bg-spider-cyan-500/10 border border-spider-cyan-500/30 text-spider-cyan-600 dark:text-spider-cyan-400 font-mono font-bold text-[11px]">
              English ? తెలుగు ? हिन्दी
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center relative z-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-spider-red-500/10 border border-spider-red-500/20 text-xs text-spider-red-600 dark:text-spider-red-400 mb-6 mx-auto shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold">Powered by Bayesian Knowledge Tracing & Spider-Verse Prerequisite Web</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
          Enter The Multiverse of{" "}
          <span className="bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
            Adaptive Learning
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          VidyaFlow transforms standard textbooks into interactive prerequisite webs, real-time knowledge tracing,
          and Socratic multilingual tutoring across Classes 6-10. Select your portal to enter.
        </p>

        {/* Role Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="group p-6 rounded-3xl spider-card border border-slate-200 dark:border-white/10 hover:border-spider-cyan-400/50 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
              >
                {/* Glow pill */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition text-2xl`}
                  >
                    <span>{r.emoji}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-0.5">
                    {r.title}
                  </h3>
                  <p className="text-xs font-bold text-spider-blue-600 dark:text-spider-cyan-400 mb-1">{r.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3">{r.tagline}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{r.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-3">{r.stats}</div>
                  <Link
                    href={r.href}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-spider-red-500 to-spider-blue-600 hover:from-spider-red-400 hover:to-spider-blue-500 text-white font-bold text-xs shadow-neon-cyan transition-all"
                  >
                    <span>Launch {r.role} Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200/80 dark:border-white/10 text-left">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <Cpu className="w-5 h-5 text-spider-cyan-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bayesian Knowledge Tracing</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Mathematical formula calculating real-time concept mastery.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <GitFork className="w-5 h-5 text-purple-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Prerequisite Root-Cause Gaps</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pinpoints unmastered sub-skills before moving ahead.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <Sparkles className="w-5 h-5 text-emerald-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Socratic Multilingual AI</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">English, Telugu, and Hindi assistive coaching hints.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <Layers className="w-5 h-5 text-amber-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Textbook Dataset Ingestion</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Direct parsing of state and central board curricula.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 py-6 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        <p>VIDYAFLOW ? CINEMATIC SPIDER-VERSE ADAPTIVE LEARNING PLATFORM ? TELANGANA SCERT & ICSE</p>
      </footer>
    </main>
  );
}
