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
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            Chapter Notes & AI Summaries
          </h1>
          <p className="text-xs text-gray-400 mt-1">
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
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading notes...</div>}>
      <NotesContent />
    </Suspense>
  );
}
