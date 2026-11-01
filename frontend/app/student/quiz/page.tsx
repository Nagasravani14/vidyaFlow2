"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import QuizEngine from "@/components/QuizEngine";
import ChapterQuiz from "@/components/ChapterQuiz";
import AICoachChatbot from "@/components/AICoachChatbot";
import { Sparkles, Layers, BookOpen, ChevronDown } from "lucide-react";

interface ChapterMeta {
  chapter_id: string;
  class: number;
  subject: string;
  chapter_number: number;
  chapter_title: string;
  quiz_count: number;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as any) || "adaptive";
  const conceptId = searchParams.get("concept_id") ? parseInt(searchParams.get("concept_id")!) : undefined;
  const chapterIdParam = searchParams.get("chapter_id");
  const lessonIdParam = searchParams.get("lesson_id");

  const [availableChapters, setAvailableChapters] = useState<ChapterMeta[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapterIdParam && isNaN(Number(chapterIdParam))
      ? chapterIdParam
      : "class_8_mathematics_ch01_rational_numbers"
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | number | undefined>(
    lessonIdParam || (chapterIdParam && !isNaN(Number(chapterIdParam)) ? chapterIdParam : undefined)
  );

  useEffect(() => {
    async function loadChapters() {
      try {
        const res = await fetch("/api/dataset/chapters");
        const data = await res.json();
        if (data.success && Array.isArray(data.chapters)) {
          setAvailableChapters(data.chapters);
          if (chapterIdParam) {
            const found = data.chapters.find((c: ChapterMeta) => c.chapter_id === chapterIdParam);
            if (found) setSelectedChapterId(found.chapter_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
      }
    }
    loadChapters();
  }, [chapterIdParam]);

  const activeChapter = availableChapters.find((c) => c.chapter_id === selectedChapterId);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
              {mode === "diagnostic"
                ? "Diagnostic Assessment Engine"
                : mode === "challenge"
                ? "Olympiad Challenge Sprint"
                : mode === "remedial"
                ? "Prerequisite Remediation Practice"
                : "Authentic Chapter-Wise Practice Quiz"}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Questions ingested directly from state curriculum textbooks with verified explanations.
            </p>
          </div>

          {/* Chapter Selector Dropdown */}
          {availableChapters.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-gray-400 hidden sm:inline">CHAPTER:</span>
              <div className="relative">
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    setSelectedLessonId(undefined);
                  }}
                  className="bg-black/50 border border-cyan-500/40 text-cyan-300 rounded-xl px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:border-cyan-400 shadow-neon-cyan appearance-none cursor-pointer max-w-[280px] sm:max-w-[320px] truncate"
                >
                  {availableChapters.map((ch) => (
                    <option key={ch.chapter_id} value={ch.chapter_id}>
                      [Class {ch.class} {ch.subject}] Ch {ch.chapter_number}: {ch.chapter_title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Chapter Quiz component loaded from dataset */}
        <ChapterQuiz
          chapterId={selectedChapterId}
          lessonId={selectedLessonId}
          initialChapterTitle={activeChapter?.chapter_title}
        />

        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 font-mono">Loading quiz engine...</div>}>
      <QuizContent />
    </Suspense>
  );
}
