"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import QuizEngine from "@/components/QuizEngine";
import AICoachChatbot from "@/components/AICoachChatbot";

function QuizContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as any) || "adaptive";
  const conceptId = searchParams.get("concept_id") ? parseInt(searchParams.get("concept_id")!) : undefined;
  const chapterParam = searchParams.get("chapter_id") || searchParams.get("lesson_id");
  const chapterId = chapterParam ? parseInt(chapterParam) : 98;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-5 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-spider-red-500 font-bold uppercase tracking-wider">
              {mode === "diagnostic" ? "🎯 BENCHMARK TEST" : "⚡ DANGER ROOM HUD"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
            {mode === "diagnostic"
              ? "Hero Diagnostic Assessment Engine"
              : mode === "challenge"
              ? "Danger Room Olympiad Sprint"
              : mode === "remedial"
              ? "Danger Room Prerequisite Remediation"
              : "Danger Room Adaptive Practice"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Questions ingested directly from state curriculum textbooks with real-time Bayesian Knowledge Tracing updates.
          </p>
        </div>

        <QuizEngine conceptId={conceptId} chapterId={chapterId} mode={mode} />
        <AICoachChatbot initialOpen={false} chapterId={chapterId} />
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Danger Room engine...</div>}>
      <QuizContent />
    </Suspense>
  );
}
