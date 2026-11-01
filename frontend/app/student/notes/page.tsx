"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChapterSummary from "@/components/ChapterSummary";
import AICoachChatbot from "@/components/AICoachChatbot";
import ThemeToggle from "@/components/ThemeToggle";

function NotesContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapter_id") ? parseInt(searchParams.get("chapter_id")!) : 2;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                CLASS 8 → MATHEMATICS → WHOLE NUMBERS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
              Whole Numbers — Notes & AI Summaries
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Comprehensive AI summary, key formulas, core definitions, and interactive recall flashcards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/student/concept-map?chapter_id=class_8_mathematics_ch01_rational_numbers&tab=mindmap"
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/30 transition flex items-center gap-1.5"
            >
              <span>🧠 Open Mind Map</span>
            </a>
            <a
              href="/student/concept-map?chapter_id=class_8_mathematics_ch01_rational_numbers&tab=quiz"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1.5"
            >
              <span>🎯 Chapter Quiz</span>
            </a>
            <ThemeToggle />
          </div>
        </div>

        <ChapterSummary chapterId={chapterId} />
        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading notes...</div>}>
      <NotesContent />
    </Suspense>
  );
}
