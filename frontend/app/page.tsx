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
} from "lucide-react";

export default function LandingRoleSelector() {
  const roles = [
    {
      role: "Student",
      name: "Ananya Sharma",
      tagline: "Class 8A • Telangana State Board",
      description:
        "Personalized adaptive learning flow, real-time BKT mastery tracking, interactive prerequisite mind maps, and Socratic AI Coach.",
      href: "/student/dashboard",
      icon: GraduationCap,
      color: "from-cyan-500 to-blue-600",
      accent: "cyan",
      badge: "ACTIVE LEARNER",
      stats: "78% Math Mastery • 3 Active Gaps",
    },
    {
      role: "Teacher",
      name: "Mr. R. Sharma",
      tagline: "Mathematics Educator • Class 8A (32 Students)",
      description:
        "Classroom mastery overview, root-cause gap detection, and actionable AI interventions ('AI Suggests, Teacher Decides').",
      href: "/teacher/dashboard",
      icon: Users,
      color: "from-purple-600 to-indigo-700",
      accent: "purple",
      badge: "EDUCATOR PORTAL",
      stats: "18 Mastered • 9 Developing • 5 Needs Support",
    },
    {
      role: "Parent",
      name: "Rajesh Sharma",
      tagline: "Guardian of Ananya Sharma",
      description:
        "Weekly AI progress insights, subject readiness percentiles, direct teacher correspondence, and upcoming diagnostic test schedules.",
      href: "/parent/dashboard",
      icon: HeartHandshake,
      color: "from-emerald-500 to-teal-700",
      accent: "emerald",
      badge: "PARENT OVERSIGHT",
      stats: "Math 78% • Science 84% • English 91%",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-between relative overflow-hidden">
      {/* Cinematic Intro Animation Overlay */}
      <CinematicIntro />

      {/* Spider-Verse Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                VidyaFlow
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest block">
                ADAPTIVE LEARNING SYSTEM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <ReplayIntroButton />
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hidden sm:inline-flex">
              Telangana • CBSE • ICSE (Classes 6–10)
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
              EN • తెలుగు • हिन्दी
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300 mb-6 shadow-neon-cyan">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Powered by Bayesian Knowledge Tracing & Concept Prerequisite Graphs</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Next-Generation{" "}
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Adaptive Learning
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          VidyaFlow transforms standard textbooks into interactive prerequisite graphs, real-time knowledge tracing,
          and Socratic multilingual tutoring across Classes 6–10. Select your role to launch your portal.
        </p>

        {/* Role Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="group p-6 rounded-3xl glass-card border border-white/10 hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
              >
                {/* Glow pill */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-0.5">{r.role} Portal</h3>
                  <p className="text-xs font-semibold text-cyan-400 mb-3">{r.name}</p>
                  <p className="text-xs text-gray-400 font-mono mb-3">{r.tagline}</p>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">{r.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-[11px] font-mono text-gray-400 mb-3">{r.stats}</div>
                  <Link
                    href={r.href}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-neon-cyan transition-all"
                  >
                    <span>Enter {r.role} Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Bayesian Knowledge Tracing</h4>
            <p className="text-[11px] text-gray-400 mt-1">Mathematical formula calculating real-time concept mastery.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <GitFork className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Prerequisite Root-Cause Gaps</h4>
            <p className="text-[11px] text-gray-400 mt-1">Pinpoints unmastered sub-skills before moving ahead.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Socratic Multilingual AI</h4>
            <p className="text-[11px] text-gray-400 mt-1">English, Telugu, and Hindi assistive coaching hints.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <Layers className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Textbook Dataset Ingestion</h4>
            <p className="text-[11px] text-gray-400 mt-1">Direct parsing of state and central board curricula.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-gray-500">
        <p>© 2026 VidyaFlow Adaptive Learning Systems • Telangana State Board • CBSE • ICSE</p>
      </footer>
    </main>
  );
}
