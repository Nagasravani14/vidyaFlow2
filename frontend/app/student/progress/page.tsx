"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Video,
  Clock,
  Sparkles,
  GitFork,
  Target,
  ShieldCheck,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function StudentProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await fetchFromAPI("/api/student/progress/1");
      setData(res);
    } catch (err) {
      console.warn("Could not fetch progress from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const user = data?.user || { name: "Ananya Sharma", grade_level: 8, section: "A", board: "telangana" };
  const aggregateMastery = data?.aggregate_mastery_percent || 0;
  const breakdown = data?.mastery_breakdown || { strong: 0, developing: 0, needs_support: 0 };
  const lessons = data?.lessons_progress || [];
  const conceptMastery = data?.concept_mastery || [];
  const videoProg = data?.video_progress || { completed_videos: 0, total_watch_seconds: 0 };
  const subjectProg = data?.subject_progress || {};

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                ACADEMIC YEAR 2026–27 • {user.board?.toUpperCase() || "TELANGANA STATE BOARD"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              <span>Learning Progress &amp; Mastery</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Class {user.grade_level || 8}{user.section || "A"} • Authoritative Bayesian Knowledge Tracing metrics across curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProgress}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition"
              title="Refresh progress data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>BKT Verified</span>
            </div>
          </div>
        </div>

        {/* Hero KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aggregate Mastery */}
          <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-[#0B0F19] shadow-neon-cyan">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-300 uppercase">AGGREGATE MASTERY</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{aggregateMastery}%</div>
            <div className="w-full h-1.5 rounded-full bg-white/10 mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                style={{ width: `${Math.min(100, aggregateMastery)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block">Weighted BKT across all active concepts</span>
          </div>

          {/* Strong / Mastered */}
          <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-emerald-300 uppercase">MASTERED CONCEPTS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-300">{breakdown.strong}</div>
            <p className="text-xs text-gray-400 mt-2">P(L) &gt; 75% • High retention</p>
          </div>

          {/* Developing */}
          <div className="p-5 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-300 uppercase">DEVELOPING CONCEPTS</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300">{breakdown.developing}</div>
            <p className="text-xs text-gray-400 mt-2">45% ≤ P(L) ≤ 75% • In practice</p>
          </div>

          {/* Needs Support */}
          <div className="p-5 rounded-2xl glass-card border border-red-500/30 bg-red-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-red-300 uppercase">REMEDIAL TARGETS</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-300">{breakdown.needs_support}</div>
            <p className="text-xs text-gray-400 mt-2">P(L) &lt; 45% • Focus recommended</p>
          </div>
        </div>

        {/* Subject Mastery & Video Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Mastery Bars */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Subject Mastery Levels</span>
            </h3>

            <div className="space-y-4">
              {Object.entries(subjectProg).map(([subj, pct]: [string, any]) => (
                <div key={subj} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200">{subj}</span>
                    <span className="font-mono text-cyan-300 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Videos & Practice Engagement */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Video className="w-5 h-5 text-cyan-400" />
                <span>Video Learning Stats</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300">Completed Videos</span>
                  <span className="text-sm font-bold text-cyan-300">{videoProg.completed_videos}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300">Watch Time</span>
                  <span className="text-sm font-bold text-purple-300">
                    {Math.round(videoProg.total_watch_seconds / 60)} mins
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/student/videos"
              className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold text-center transition flex items-center justify-center gap-2"
            >
              <span>Explore Learning Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tracked Lessons Section */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Tracked Textbook Lessons ({lessons.length})</span>
              </h3>
              <p className="text-xs text-gray-400">
                Authoritative lesson completion status based on content exploration and practice scores.
              </p>
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No lessons tracked yet. Open a chapter from My Learning to begin tracking!
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((l: any) => {
                const isCompleted = l.status === "completed";
                return (
                  <div
                    key={l.lesson_id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {isCompleted ? "COMPLETED ✓" : "IN PROGRESS"}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {l.subject} • Class {l.grade_level}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{l.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        <span>Practice Score: <strong className="text-gray-200">{l.practice_score_percent}%</strong></span>
                        <span>•</span>
                        <span>Questions: {l.questions_correct} / {l.questions_attempted} correct</span>
                        <span>•</span>
                        <span>Content: {l.content_completed ? "Explored ✓" : "Incomplete"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/student/concept-map?lesson_id=${l.lesson_id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Interactive Mind Map</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Concept Mastery Table */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-purple-400" />
            <span>Bayesian Knowledge Tracing Concept Mastery ({conceptMastery.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Concept Code</th>
                  <th className="py-2.5 px-3">Concept Title</th>
                  <th className="py-2.5 px-3">Mastery Status</th>
                  <th className="py-2.5 px-3">P(L) Probability</th>
                  <th className="py-2.5 px-3">Attempts</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {conceptMastery.map((c: any) => {
                  const isStrong = c.status === "Strong";
                  const isDev = c.status === "Developing";
                  return (
                    <tr key={c.concept_id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-3 font-mono text-cyan-300 font-bold">{c.code}</td>
                      <td className="py-3 px-3 text-white font-medium">{c.title}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isStrong
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isDev
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-100">
                        {(c.p_mastery * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-gray-400 font-mono">
                        {c.correct_count} / {c.attempts_count}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href="/student/quiz?mode=adaptive"
                          className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                        >
                          Practice →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
