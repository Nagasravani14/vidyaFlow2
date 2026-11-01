"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
  ArrowRight,
  GitFork,
  BookOpen,
  Filter,
  Check,
  X,
  Layers,
  GraduationCap,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Intervention {
  id: number;
  title: string;
  type: string;
  status: "pending" | "approved" | "rejected" | string;
  students: string[];
  rationale: string;
  suggested_action: string;
}

export default function TeacherDashboard() {
  const [classData, setClassData] = useState<any>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        setLoading(true);
        const data = await fetchFromAPI("/api/teacher/overview");
        setClassData(data);
        setInterventions(data.interventions || []);
      } catch (err) {
        console.warn("Using fallback local teacher overview:", err);
        const fallback = {
          classroom_name: "Class 8A",
          subject: "Mathematics",
          total_students: 32,
          distribution: {
            mastered: 18,
            developing: 9,
            needs_support: 5,
          },
          ai_insights: [
            "⚠️ 5 students (15.6%) are consistently struggling with signed Integer Operations, blocking equation transposition.",
            "📊 Fractions reduction is a class-wide gap: 48% error rate detected on cross-multiplication fractional equations.",
            "⚡ Rahul Nair and Tanvi Rao have reached 95%+ Mastery and are eligible for Olympiad-grade Challenge Modules.",
            "💡 AI Recommendation: Run a 10-minute Peer Tutoring session before the Friday Unit Assessment.",
          ],
          struggling_students: [
            { name: "Ananya Sharma", gap: "Integer Operations & Transposition", mastery: "42%", trend: "improving" },
            { name: "Sneha Reddy", gap: "Variables on Both Sides", mastery: "38%", trend: "needs_remediation" },
            { name: "Karthik Verma", gap: "Negative Signs Multiplication", mastery: "35%", trend: "needs_remediation" },
            { name: "Arjun Rao", gap: "Fractional Equations", mastery: "41%", trend: "stable" },
            { name: "Divya Patel", gap: "Word Problem Translation", mastery: "44%", trend: "improving" },
          ],
          interventions: [
            {
              id: 1,
              title: "Remedial Group: Integer Operations & Sign Rules",
              type: "remedial_group",
              status: "pending",
              students: ["Ananya Sharma", "Karthik Verma", "Sneha Reddy", "Arjun Rao", "Divya Patel"],
              rationale: "5 students are consistently missing transposition steps due to negative sign errors (-14 - (-9)).",
              suggested_action: "Assign 15-minute visual number line interactive module before tomorrow's algebra period.",
            },
            {
              id: 2,
              title: "Peer Tutoring Pairing: Equation Transposition",
              type: "peer_tutoring",
              status: "pending",
              students: ["Rahul Nair (Mentor)", "Sneha Reddy (Mentee)"],
              rationale: "Rahul has achieved 94% Strong Mastery on Variables on Both Sides. Pairing him with Sneha will resolve transposition blockers.",
              suggested_action: "Schedule a 10-minute collaborative practice sprint during Friday homeroom.",
            },
            {
              id: 3,
              title: "Class-Wide Remediation: Fractions Reduction Gap",
              type: "gap_worksheet",
              status: "approved",
              students: ["Entire Class 8A (32 students)"],
              rationale: "BKT diagnostic flags 48% class-wide error rate when solving cross-multiplication equations.",
              suggested_action: "Deploy 5-question starter quiz at start of next lesson.",
            },
          ],
        };
        setClassData(fallback);
        setInterventions(fallback.interventions);
      } finally {
        setLoading(false);
      }
    }

    loadTeacherData();
  }, []);

  const handleInterventionAction = async (interventionId: number, action: "approve" | "reject") => {
    try {
      await fetchFromAPI("/api/teacher/intervention/action", {
        method: "POST",
        body: JSON.stringify({
          intervention_id: interventionId,
          action: action,
        }),
      });
    } catch (err) {
      console.log("Local intervention state updated");
    }

    setInterventions((prev) =>
      prev.map((item) =>
        item.id === interventionId
          ? { ...item, status: action === "approve" ? "approved" : "rejected" }
          : item
      )
    );

    setActionFeedback({
      id: interventionId,
      message: action === "approve" ? "Intervention Approved & Dispatched!" : "Intervention Rejected.",
    });

    setTimeout(() => setActionFeedback(null), 3000);
  };

  const dist = classData?.distribution || { mastered: 18, developing: 9, needs_support: 5 };
  const total = classData?.total_students || 32;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="teacher" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                EDUCATOR COMMAND CENTER • CLASS 8A
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-300 to-white bg-clip-text text-transparent">
              Classroom Mastery Overview
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Mathematics • Chapter: Linear Equations in One Variable • 32 Active Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
              AI Suggests, Teacher Decides
            </span>
          </div>
        </div>

        {/* Section 1: Class Overview Mastery Distribution (32 students) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mastered Card */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-neon-emerald flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block mb-1">
                MASTERED / STRONG (&gt;75%)
              </span>
              <div className="text-4xl font-extrabold text-white">{dist.mastered}</div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((dist.mastered / total) * 100)}% of classroom cohort
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Developing Card */}
          <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-amber-400 font-semibold block mb-1">
                DEVELOPING (45–75%)
              </span>
              <div className="text-4xl font-extrabold text-white">{dist.developing}</div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((dist.developing / total) * 100)}% on track to mastery
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>

          {/* Needs Support Card */}
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-red-400 font-semibold block mb-1">
                NEEDS SUPPORT (&lt;45%)
              </span>
              <div className="text-4xl font-extrabold text-white">{dist.needs_support}</div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((dist.needs_support / total) * 100)}% targeted for remediation
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Section 2: AI Class Insights */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">AI Class Diagnostics & Pattern Detection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(classData?.ai_insights || []).map((insight: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 text-xs text-gray-200 leading-relaxed transition"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Actionable Interventions ("AI Suggests, Teacher Decides") */}
        <div id="interventions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <span>Actionable Interventions: AI Suggests, Teacher Decides</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Review automated grouping, peer tutoring pairs, and remedial worksheets before deployment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {interventions.map((it) => {
              const isApproved = it.status === "approved";
              const isRejected = it.status === "rejected";
              const isPending = it.status === "pending";

              return (
                <div
                  key={it.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isApproved
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : isRejected
                      ? "bg-gray-900/40 border-white/5 opacity-60"
                      : "glass-card border-white/10 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {it.type.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-mono ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isRejected
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          STATUS: {it.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{it.title}</h3>
                    </div>

                    {/* Teacher Decision Buttons */}
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleInterventionAction(it.id, "approve")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-neon-emerald transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Intervention</span>
                          </button>
                          <button
                            onClick={() => handleInterventionAction(it.id, "reject")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 text-xs font-semibold transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-gray-400">
                          {isApproved ? "✓ Teacher Approved" : "✗ Rejected"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300 pt-2 border-t border-white/5">
                    <div>
                      <span className="font-semibold text-gray-200 block mb-1">AI Rationale:</span>
                      <p className="leading-relaxed text-gray-400">{it.rationale}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-200 block mb-1">Proposed Execution:</span>
                      <p className="leading-relaxed text-cyan-300">{it.suggested_action}</p>
                    </div>
                  </div>

                  {/* Student roster chip row */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-400">Target Students:</span>
                    {it.students.map((st, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-200"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Struggling Students Focus Table */}
        <div id="students" className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-400" />
              <span>Remediation Priority Queue (5 Students)</span>
            </h2>
            <span className="text-xs text-gray-400">Ranked by lowest prerequisite mastery</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Student Name</th>
                  <th className="py-3 px-4">Detected Knowledge Gap</th>
                  <th className="py-3 px-4">BKT Score</th>
                  <th className="py-3 px-4">Trend</th>
                  <th className="py-3 px-4 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(classData?.struggling_students || []).map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3.5 px-4 text-cyan-300">{s.gap}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">{s.mastery}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          s.trend === "improving"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {s.trend.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/student/quiz?mode=remedial`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>Inspect Graph</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
