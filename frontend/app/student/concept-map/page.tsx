"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MindMapViewer from "@/components/MindMapViewer";
import AICoachChatbot from "@/components/AICoachChatbot";

function ConceptMapContent() {
  const searchParams = useSearchParams();
  const lessonIdParam = searchParams.get("lesson_id") || searchParams.get("chapter_id");
  const lessonId = lessonIdParam ? parseInt(lessonIdParam) : 2;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-spider-cyan-500 font-bold uppercase tracking-wider">
              PREREQUISITE KNOWLEDGE WEB ? CHAPTER 2
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent">
            Web of Knowledge ? Concept Prerequisite Graph
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Interactive constellation showing connected sub-skills, real-time BKT mastery levels, and remedial pathways.
          </p>
        </div>

        <MindMapViewer lessonId={lessonId} />
        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function ConceptMapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Spider Knowledge Web...</div>}>
      <ConceptMapContent />
    </Suspense>
  );
}
