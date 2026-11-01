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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {mode === "diagnostic"
              ? "Diagnostic Assessment Engine"
              : mode === "challenge"
              ? "Olympiad Challenge Sprint"
              : mode === "remedial"
              ? "Prerequisite Remediation Practice"
              : "Adaptive Mastery Practice"}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Questions ingested directly from state curriculum textbooks with real-time Bayesian Knowledge Tracing updates.
          </p>
        </div>

        <QuizEngine conceptId={conceptId} chapterId={2} mode={mode} />
        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading quiz engine...</div>}>
      <QuizContent />
    </Suspense>
  );
}
