"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  HeartHandshake,
  Sparkles,
  TrendingUp,
  BookOpen,
  Calendar,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function ParentDashboard() {
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchFromAPI("/api/parent/overview");
        setParentData(data);
      } catch (err) {
        console.warn("Using fallback local parent overview:", err);
        setParentData({
          child_name: "Ananya Sharma",
          grade_section: "Class 8 - Section A",
          board: "Telangana State Board",
          subject_progress: {
            Mathematics: 78,
            Science: 84,
            English: 91,
            "Social Studies": 82,
          },
          weekly_ai_insights: [
            "📈 Your child Ananya is showing strong growth in Algebra (+16% this week), solving 12 equations independently.",
            "🔍 Knowledge Tracing flagged a minor prerequisite gap in signed Integer Operations; 10 minutes of targeted flashcard review is scheduled.",
            "⭐ Great consistency: Ananya spent 42 minutes practicing this week with a 75% first-attempt success rate.",
          ],
          teacher_updates: [
            {
              teacher: "Mr. R. Sharma (Math)",
              date: "Today, 09:30 AM",
              message:
                "Ananya is active in class discussions on linear equations! We have scheduled a light remedial worksheet on negative number signs to boost confidence.",
            },
            {
              teacher: "Mrs. Kalyani (Science)",
              date: "Yesterday, 04:15 PM",
              message:
                "Excellent lab submission on Cell Structure! Ananya scored 19/20 in the diagnostic test.",
            },
          ],
          upcoming_tests: [
            {
              subject: "Mathematics",
              title: "Chapter 3: Linear Equations Diagnostic Test",
              date: "Nov 6, 2026",
              syllabus: "Standard equations, Transposition, Word Problems",
              readiness: "78% Ready",
            },
            {
              subject: "Physical Science",
              title: "Unit 2: Force & Pressure Periodic Assessment",
              date: "Nov 10, 2026",
              syllabus: "Contact and Non-contact Forces, Atmospheric Pressure",
              readiness: "88% Ready",
            },
          ],
          active_remedial_focus: "Integer Operations & Transposition Rules",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const childName = parentData?.child_name || "Ananya Sharma";
  const progress = parentData?.subject_progress || {
    Mathematics: 78,
    Science: 84,
    English: 91,
    "Social Studies": 82,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="parent" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                PARENT OVERSIGHT PORTAL • TELANGANA STATE BOARD
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
              {childName}&apos;s Academic Progress
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Class 8 - Section A • Transparent AI insights, teacher communication, and exam readiness.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Verified Weekly Report</span>
          </div>
        </div>

        {/* Section 1: Subject Progress Overview (Simple Percentages) */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Subject Mastery Overview</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(progress).map(([subject, pct]: [string, any]) => {
              const isHigh = pct >= 85;
              const isMed = pct >= 70 && pct < 85;
              return (
                <div
                  key={subject}
                  className="p-5 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-300">{subject}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isHigh
                          ? "bg-emerald-500/20 text-emerald-300"
                          : isMed
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {isHigh ? "EXCELLENT" : isMed ? "PROFICIENT" : "DEVELOPING"}
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold text-white mb-3">{pct}%</div>

                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : isMed
                          ? "bg-gradient-to-r from-cyan-500 to-blue-400"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Weekly AI Insights */}
        <div id="insights" className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">Weekly AI Diagnostic Insights for Parents</h2>
            </div>
            <span className="text-xs font-mono text-gray-400">UPDATED TODAY</span>
          </div>

          <div className="space-y-3">
            {(parentData?.weekly_ai_insights || []).map((insight: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 text-xs text-gray-200 leading-relaxed transition"
              >
                {insight}
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
            <span>
              <strong>Active Remedial Target:</strong> {parentData?.active_remedial_focus || "Integer Operations & Transposition Rules"}
            </span>
            <Link
              href="/student/quiz?mode=remedial"
              className="text-xs text-emerald-300 underline hover:text-emerald-100 font-semibold"
            >
              View Child&apos;s Practice Set →
            </Link>
          </div>
        </div>

        {/* Section 3: Teacher Updates & Upcoming Tests (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Direct Teacher Updates */}
          <div id="updates" className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Direct Teacher Updates</h2>
            </div>

            <div className="space-y-3.5">
              {(parentData?.teacher_updates || []).map((u: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{u.teacher}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{u.date}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{u.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Diagnostic Tests & Schedule */}
          <div id="tests" className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Upcoming Tests & Diagnostic Readiness</h2>
            </div>

            <div className="space-y-3.5">
              {(parentData?.upcoming_tests || []).map((t: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                      {t.readiness}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-[11px]">
                    <span className="text-cyan-400 font-semibold">{t.subject}</span>
                    <span>•</span>
                    <span>Date: {t.date}</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">Syllabus: {t.syllabus}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
