"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MindMapViewer from "@/components/MindMapViewer";
import AICoachChatbot from "@/components/AICoachChatbot";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ChevronRight,
  GitFork,
  FileText,
  Play,
  RotateCcw,
  ShieldAlert,
  Target,
  Compass,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchFromAPI("/api/student/dashboard/1");
      setDashboardData(data);
    } catch (err) {
      console.warn("Using fallback student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const student = dashboardData?.user || { name: "Ananya Sharma", grade_level: 8, section: "A" };
  const chapter = dashboardData?.active_chapter || { id: 98, title: "Linear Equations in One Variable" };
  const activeChapterId = chapter?.id || 98;
  const rec = dashboardData?.today_recommendation || {
    title: "Remediate Prerequisite: Integer Operations",
    reason: "Fix sign rules and bracket operations to unlock quadratic equations.",
    action_route: "/student/quiz?mode=remedial",
  };
  const progressPct = dashboardData?.chapter_progress_percent || 68;
  const continueLearning = dashboardData?.continue_learning;
  const achievements = dashboardData?.achievements || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Spider Command Center Billboard Header */}
        <div className="relative rounded-3xl p-6 lg:p-8 overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-navy-900/85 backdrop-blur-xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Halftone & ambient glow */}
          <div className="halftone-pattern absolute inset-0 opacity-20 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-spider-red-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-spider-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-spider-red-500/15 text-spider-red-500 dark:text-spider-red-400 border border-spider-red-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-spider-red-500 animate-pulse" />
                  SPIDER COMMAND CENTER ? CLASS {student.grade_level || 8}{student.section || "A"}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {student.board?.toUpperCase() || "TELANGANA SCERT"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
                  {student.name}
                </span>{" "}
                🕷️
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Your BKT knowledge-tracing web is synchronised. 3 daily objectives ready to clear.
              </p>
            </div>

            {/* Level & Streak HUD Stat Group */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                  <Flame className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">5 Days</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">STREAK</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Web Warrior Status</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spider-blue-500/20 text-spider-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {320 + achievements.length * 50} XP
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-spider-blue-500/20 text-spider-blue-400">LVL 8</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Spider Cadet</p>
                </div>
              </div>

              <button
                onClick={loadData}
                className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-spider-cyan-400 border border-slate-200 dark:border-white/10 transition"
                title="Synchronize Dashboard"
                aria-label="Synchronize Dashboard"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Continue Learning Mission Banner */}
        {continueLearning && (
          <div className="p-5 rounded-2xl border border-spider-cyan-500/40 bg-gradient-to-r from-spider-cyan-500/10 via-spider-blue-500/10 to-transparent dark:bg-navy-850/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-spider-cyan-500/20 text-spider-cyan-400 flex items-center justify-center shadow-sm">
                <Play className="w-5 h-5 fill-spider-cyan-400 text-spider-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-spider-cyan-500 font-bold tracking-wider">
                  ACTIVE MISSION ? CONTINUE WHERE YOU LEFT OFF
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {continueLearning.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {continueLearning.subject} ? Practice Mastery: {continueLearning.score_percent}%
                </p>
              </div>
            </div>

            <Link
              href={continueLearning.route}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-spider-cyan-500 to-spider-blue-600 hover:from-spider-cyan-400 hover:to-spider-blue-500 text-white font-bold text-xs shadow-neon-cyan hover:scale-105 transition flex items-center gap-1.5"
            >
              <span>Resume Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Asymmetric Spider-Verse Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="spider-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Daily Objectives
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">3 / 4</h3>
              <p className="text-[10px] text-emerald-500 font-semibold mt-1">75% Completed Today</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="spider-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Web Mastery
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">78%</h3>
              <p className="text-[10px] text-spider-blue-500 font-semibold mt-1">BKT Engine Verified</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-spider-blue-500/10 text-spider-blue-500 flex items-center justify-center">
              <GitFork className="w-5 h-5" />
            </div>
          </div>

          <div className="spider-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Danger Room Accuracy
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">84%</h3>
              <p className="text-[10px] text-purple-500 font-semibold mt-1">First-Attempt Score</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="spider-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Prerequisite Gaps
              </p>
              <h3 className="text-2xl font-extrabold text-spider-red-500 dark:text-spider-red-400 mt-0.5">
                {dashboardData?.mastery_breakdown?.needs_support || 2}
              </h3>
              <p className="text-[10px] text-rose-500 font-semibold mt-1">Villain Gaps Detected</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-spider-red-500/10 text-spider-red-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* "Today's Recommended Learning Sprint" Hero HUD */}
        <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-spider-blue-500/40 bg-gradient-to-br from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-spider-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-spider-red-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spider-cyan-500/20 text-spider-cyan-300 border border-spider-cyan-500/40 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TODAY&apos;S RECOMMENDED HERO MISSION</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {chapter.title}
              </h2>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {rec.reason}
              </p>

              {/* Progress Bar */}
              <div className="pt-2 max-w-xl">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span>Chapter Mastery Progress</span>
                  <span className="text-spider-cyan-300 font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-spider-red-500 via-spider-blue-400 to-spider-cyan-400 rounded-full transition-all duration-700 shadow-neon-cyan"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={rec.action_route || "/student/quiz?mode=remedial"}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-spider-red-500 to-spider-blue-600 hover:from-spider-red-400 hover:to-spider-blue-500 text-white font-bold text-xs shadow-neon-red transition-all hover:scale-105"
                >
                  <Zap className="w-4 h-4" />
                  <span>{rec.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/student/learning"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-medium transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Multiverse Textbooks</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Pillar */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                KNOWLEDGE TRACING RADAR
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mastered Concepts (&gt;75%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.strong || 2}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Developing Concepts (45?"75%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.developing || 1}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-rose-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Needs Remediation (&lt;45%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.needs_support || 3}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>Active Remedial Target:</span>
                <span className="text-spider-red-400 font-bold">Integer Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Achievements & Recent Learning Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spider Trophy Room Preview */}
          <div className="spider-card space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Spider Trophy Room ({achievements.length})</span>
              </h3>
              <Link
                href="/student/achievements"
                className="text-xs text-spider-blue-500 dark:text-spider-cyan-400 font-mono hover:underline"
              >
                View All ?
              </Link>
            </div>

            {achievements.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                Complete your first practice mission or test to unlock badges in the Trophy Room!
              </p>
            ) : (
              <div className="space-y-2.5">
                {achievements.slice(0, 3).map((ach: any) => (
                  <div
                    key={ach.code}
                    className="p-3 rounded-xl bg-amber-500/5 dark:bg-white/5 border border-amber-500/20 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Event Audit Trail */}
          <div className="spider-card space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-spider-cyan-500" />
                <span>Recent Mission Log</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">LIVE DATABASE AUDIT</span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                Explore a mind map or start practicing to record activities in your mission log.
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 4).map((act: any) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-spider-blue-600 dark:text-spider-cyan-300 uppercase text-[11px] font-semibold">
                      {act.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {new Date(act.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: Interactive Web of Knowledge Prerequisite Map */}
        <div className="spider-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 text-spider-cyan-500" />
                <span>Chapter Prerequisite Knowledge Web</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing prerequisite links, BKT mastery weights, and root-cause knowledge gaps.
              </p>
            </div>

            <Link
              href={`/student/concept-map?lesson_id=${activeChapterId}`}
              className="text-xs font-bold text-spider-blue-500 dark:text-spider-cyan-400 hover:text-spider-cyan-300 flex items-center gap-1 transition"
            >
              <span>Full Screen Web</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <MindMapViewer lessonId={activeChapterId} />
        </div>

        {/* Floating Spider AI Coach */}
        <AICoachChatbot initialOpen={false} chapterId={activeChapterId} />
      </main>
    </div>
  );
}
