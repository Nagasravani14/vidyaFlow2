"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChapterSummary from "@/components/ChapterSummary";
import AICoachChatbot from "@/components/AICoachChatbot";

function NotesContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapter_id") ? parseInt(searchParams.get("chapter_id")!) : 2;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-teal-500 font-bold uppercase tracking-wider">
              📖 SECRET ARCHIVES & REVISION CHEATS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
            Secret Archives ? Chapter Notes & AI Summaries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthesized core concepts, key algebraic formulas, bilingual definitions, and interactive flashcards.
          </p>
        </div>

        <ChapterSummary chapterId={chapterId} />
        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading secret archives...</div>}>
      <NotesContent />
    </Suspense>
  );
}
