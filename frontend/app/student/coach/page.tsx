"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AICoachChatbot from "@/components/AICoachChatbot";
import ThemeToggle from "@/components/ThemeToggle";
import { BotMessageSquare, Sparkles, BookOpen, ShieldCheck } from "lucide-react";

export default function CoachPage() {
  const [selectedChapter, setSelectedChapter] = useState({
    id: 1,
    title: "Linear Equations in One Variable",
    subject: "Mathematics",
    gradeLevel: 8,
    board: "Telangana State Board",
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                ACADEMIC YEAR 2026–27 • {selectedChapter.board.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
              <BotMessageSquare className="w-8 h-8 text-cyan-400" />
              <span>Socratic AI Coach</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Personalized AI tutor grounded in authentic textbook passages, providing progressive hints and Socratic guidance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Class {selectedChapter.gradeLevel} {selectedChapter.subject}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
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
