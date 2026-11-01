"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MindMapViewer from "@/components/MindMapViewer";
import ChapterMindMap from "@/components/ChapterMindMap";
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
    // Auto-refresh on focus for instant dashboard synchronization (Section 8)
    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const student = dashboardData?.user || { name: "Ananya Sharma", grade_level: 8, section: "A" };
  const chapter = dashboardData?.active_chapter || { title: "Linear Equations in One Variable" };
  const rec = dashboardData?.today_recommendation || {
    title: "Remediate Prerequisite: Integer Operations",
    reason: "Fix sign rules to unlock linear equations.",
    action_route: "/student/quiz?mode=remedial",
  };
  const progressPct = dashboardData?.chapter_progress_percent || 68;
  const continueLearning = dashboardData?.continue_learning;
  const achievements = dashboardData?.achievements || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Top Bar with Personalized Greeting */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                ACADEMIC YEAR 2026–27 • {student.board?.toUpperCase() || "TELANGANA STATE BOARD"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
              Good morning, {student.name} 👋
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Class {student.grade_level || 8}{student.section || "A"} • Your AI Knowledge Tracing engine has updated your learning path.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <span className="font-bold text-white">5 Days</span>
                <span className="text-gray-400 text-[10px] ml-1">STREAK</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Award className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold text-white">{320 + achievements.length * 50} XP</span>
                <span className="text-gray-400 text-[10px] ml-1">POINTS</span>
              </div>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-300 border border-white/10 transition"
              title="Refresh dashboard progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 8: Continue Learning Banner (if active lesson in progress) */}
        {continueLearning && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#0B0F19] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Play className="w-5 h-5 fill-cyan-400 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  CONTINUE WHERE YOU LEFT OFF
                </span>
                <h3 className="text-base font-bold text-white">{continueLearning.title}</h3>
                <p className="text-xs text-gray-400">
                  {continueLearning.subject} • Practice Score: {continueLearning.score_percent}% • Status: {continueLearning.status.toUpperCase()}
                </p>
              </div>
            </div>

            <Link
              href={continueLearning.route}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-neon-cyan hover:scale-105 transition flex items-center gap-1.5"
            >
              <span>Resume Interactive Mind Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* "Today's Learning" Banner */}
        <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-cyan-500/30 shadow-neon-cyan bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-[#0B0F19]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TODAY&apos;S RECOMMENDED LEARNING SPRINT</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {chapter.title}
              </h2>

              <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-2xl">
                {rec.reason}
              </p>

              {/* Progress Bar */}
              <div className="pt-2 max-w-xl">
                <div className="flex items-center justify-between text-xs font-mono text-gray-300 mb-1.5">
                  <span>Chapter Mastery Progress</span>
                  <span className="text-cyan-300 font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 shadow-neon-cyan"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={rec.action_route || "/student/quiz?mode=remedial"}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-bold text-xs shadow-neon-cyan transition-all hover:scale-105"
                >
                  <Zap className="w-4 h-4" />
                  <span>{rec.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/student/learning"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 text-xs font-medium transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse All Classes 6–10 Textbooks</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Pillar */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                CONCEPT BREAKDOWN
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mastered / Strong (&gt;75%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.strong || 2}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Developing (45–75%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.developing || 1}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Needs Support (&lt;45%)</span>
                  </span>
                  <span className="font-mono font-bold">{dashboardData?.mastery_breakdown?.needs_support || 3}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Active Remedial Target:</span>
                <span className="text-red-400 font-semibold">Integer Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Achievements & Recent Learning Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unlocked Achievements */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Unlocked Achievements ({achievements.length})</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">GENUINE CONDITIONS MET</span>
            </div>

            {achievements.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Start an authentic lesson or answer practice questions to unlock your first badge!
              </p>
            ) : (
              <div className="space-y-2.5">
                {achievements.map((ach: any) => (
                  <div
                    key={ach.code}
                    className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-gray-300">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Event Audit Trail */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Recent Learning Activity</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">DATABASE EVENT STREAM</span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Explore a mind map or start practicing to record activities.
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 4).map((act: any) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-cyan-300 uppercase text-[11px]">
                      {act.event_type.replace("_", " ")}
                    </span>
                    <span className="text-gray-400 text-[10px] font-mono">
                      {new Date(act.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Section: Whole Numbers Mind Map (Class 8 Mathematics) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <GitFork className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  CLASS 8 MATHEMATICS • AUTHENTIC CURRICULUM
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
                Whole Numbers Mind Map
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Interactive concept tree and prerequisite connections from Telangana SCERT Class 8 Mathematics.
              </p>
            </div>

            <Link
              href="/student/concept-map?chapter_id=class_8_mathematics_ch01_rational_numbers"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40"
            >
              <span>Full Screen Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <ChapterMindMap
            chapterId="class_8_mathematics_ch01_rational_numbers"
            lessonId={2}
            initialTitle="Class 8 Mathematics: Whole Numbers & Number Systems"
          />
        </div>

        {/* Section: Interactive Concept Prerequisite Map */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 text-cyan-400" />
                <span>Chapter Concept Mastery Graph</span>
              </h2>
              <p className="text-xs text-gray-400">
                Visualizing prerequisite edges, mastery levels, and root-cause knowledge gaps.
              </p>
            </div>

            <Link
              href="/student/concept-map?lesson_id=2"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>Full Screen Mind Map</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <MindMapViewer lessonId={2} />
        </div>

        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}
