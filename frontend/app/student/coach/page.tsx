"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AICoachChatbot from "@/components/AICoachChatbot";
import { BotMessageSquare, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

function CoachContent() {
  const searchParams = useSearchParams();
  const chapterParam = searchParams.get("chapter_id") || searchParams.get("lesson_id");
  const initialId = chapterParam ? parseInt(chapterParam) : 98;

  const [selectedChapter, setSelectedChapter] = useState({
    id: initialId,
    title: "Linear Equations in One Variable",
    subject: "Mathematics",
    gradeLevel: 8,
    board: "Telangana State Board",
  });

  useEffect(() => {
    async function loadChapterInfo() {
      if (initialId && initialId !== 98) {
        try {
          const detail = await fetchFromAPI(`/api/curriculum/lesson/${initialId}?user_id=1`);
          if (detail?.lesson) {
            setSelectedChapter({
              id: detail.lesson.id,
              title: detail.lesson.title,
              subject: detail.textbook?.subject || "Mathematics",
              gradeLevel: detail.textbook?.grade_level || 8,
              board: detail.textbook?.board || "Telangana State Board",
            });
          }
        } catch (e) {
          console.warn("Could not load custom chapter for coach:", e);
        }
      }
    }
    loadChapterInfo();
  }, [initialId]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-5 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-spider-red-500 font-bold uppercase tracking-wider">
                ACADEMIC YEAR 2026–27 • {selectedChapter.board.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-spider-red-500 via-spider-blue-500 to-spider-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Spider AI Coach">🦸‍♂️</span>
              <span>Spider AI Coach</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multilingual Socratic mentor grounded in authentic state textbooks, providing progressive hints and guidance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-spider-blue-500/10 border border-spider-blue-500/30 text-spider-blue-600 dark:text-spider-blue-300 text-xs font-medium">
              <BookOpen className="w-4 h-4" />
              <span>Class {selectedChapter.gradeLevel} {selectedChapter.subject}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Textbook Grounded</span>
            </div>
          </div>
        </div>

        {/* Embedded Interactive AI Coach Drawer */}
        <AICoachChatbot
          isEmbedded={true}
          initialOpen={true}
          chapterId={selectedChapter.id}
          chapterTitle={selectedChapter.title}
          subject={selectedChapter.subject}
          gradeLevel={selectedChapter.gradeLevel}
          board={selectedChapter.board}
        />
      </main>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Spider AI Coach...</div>}>
      <CoachContent />
    </Suspense>
  );
}
