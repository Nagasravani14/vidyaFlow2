"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  Award,
  BookOpen,
  GitFork,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Flame,
  CheckCircle2,
  RotateCcw,
  Star,
  ArrowRight,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

// Icon mapping for badge icons
const ICON_MAP: Record<string, React.ElementType> = {
  Award: Award,
  BookOpen: BookOpen,
  GitFork: GitFork,
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  Star: Star,
  Flame: Flame,
};

export default function StudentAchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetchFromAPI("/api/student/achievements/1");
      setData(res);
    } catch (err) {
      console.warn("Could not fetch achievements from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const studentName = data?.student_name || "Ananya Sharma";
  const totalAchievements = data?.total_achievements || 0;
  const unlockedCount = data?.unlocked_count || 0;
  const lockedCount = data?.locked_count || 0;
  const totalXp = data?.total_xp || 0;
  const achievements = data?.achievements || [];

  const unlockedAchievements = achievements.filter((a: any) => a.is_unlocked);
  const lockedAchievements = achievements.filter((a: any) => !a.is_unlocked);

  const completionPct = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                ACADEMIC YEAR 2026–27 • MILESTONES &amp; MASTERY
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <span>Achievements &amp; Badges</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {studentName} • Genuine milestone accomplishments earned through active learning, exploration, and practice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAchievements}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition"
              title="Refresh achievements"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Refresh</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Verified Badges</span>
            </div>
          </div>
        </div>

        {/* Hero KPI Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total XP */}
          <div className="p-5 rounded-2xl glass-card border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-indigo-950/20 to-[#0B0F19] shadow-neon-purple flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-purple-300 uppercase block mb-1">TOTAL XP POINTS</span>
              <div className="text-3xl font-black text-white">{totalXp} XP</div>
              <span className="text-[10px] text-gray-400 mt-1 block">Level 4 Scholar • Top 15%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40 shadow-neon-purple">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Badges Unlocked */}
          <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-300 uppercase block mb-1">BADGES UNLOCKED</span>
              <div className="text-3xl font-black text-cyan-300">
                {unlockedCount} <span className="text-sm font-normal text-gray-400">/ {totalAchievements}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">{completionPct}% completion rate</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40 shadow-neon-cyan">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Locked / In-Progress */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 bg-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400 uppercase block mb-1">NEXT MILESTONES</span>
              <div className="text-3xl font-black text-gray-200">{lockedCount} Remaining</div>
              <span className="text-[10px] text-gray-400 mt-1 block">Satisfy criteria to unlock</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 text-gray-400 flex items-center justify-center border border-white/10">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section 1: Unlocked Achievements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Unlocked Badges ({unlockedAchievements.length})</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400">VERIFIED AUTHENTIC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((ach: any) => {
              const IconComp = ICON_MAP[ach.badge_icon] || Award;
              const formattedDate = ach.unlocked_at
                ? new Date(ach.unlocked_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unlocked";

              return (
                <div
                  key={ach.id}
                  className="p-5 rounded-2xl glass-card border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-black/40 to-[#0B0F19] hover:border-purple-400/60 transition shadow-sm hover:shadow-neon-purple flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                        +{ach.xp_reward || 50} XP
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{ach.title}</h3>
                      <p className="text-xs text-gray-300 leading-relaxed">{ach.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                    <span className="font-mono">{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Locked / In-Progress Badges */}
        {lockedAchievements.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <span>Next Milestone Badges ({lockedAchievements.length})</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">READY TO UNLOCK</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((ach: any) => {
                const IconComp = ICON_MAP[ach.badge_icon] || Award;
                return (
                  <div
                    key={ach.id}
                    className="p-5 rounded-2xl glass-card border border-white/10 bg-white/[0.02] hover:border-white/20 transition flex flex-col justify-between space-y-4 opacity-75 hover:opacity-95"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold">
                          +{ach.xp_reward || 50} XP
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-200 mb-1 flex items-center gap-2">
                          <span>{ach.title}</span>
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{ach.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="text-cyan-400 font-mono">Prerequisite target</span>
                      <Link
                        href="/student/quiz?mode=adaptive"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Start Practice</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
