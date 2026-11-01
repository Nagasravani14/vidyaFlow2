"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChapterMindMap from "@/components/ChapterMindMap";
import ChapterQuiz from "@/components/ChapterQuiz";
import MindMapViewer from "@/components/MindMapViewer";
import AICoachChatbot from "@/components/AICoachChatbot";
import { GitFork, Sparkles, BookOpen, Layers, ChevronDown } from "lucide-react";

interface ChapterMeta {
  chapter_id: string;
  class: number;
  subject: string;
  chapter_number: number;
  chapter_title: string;
  quiz_count: number;
  has_quiz: boolean;
  has_mindmap: boolean;
}

function ConceptMapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonIdParam = searchParams.get("lesson_id");
  const chapterIdParam = searchParams.get("chapter_id");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"mindmap" | "quiz">(
    tabParam === "quiz" ? "quiz" : "mindmap"
  );

  const [activeLessonId, setActiveLessonId] = useState<number | string | undefined>(
    lessonIdParam || (chapterIdParam && !isNaN(Number(chapterIdParam)) ? chapterIdParam : 97)
  );

  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(
    chapterIdParam && isNaN(Number(chapterIdParam)) ? chapterIdParam : undefined
  );

  const [availableChapters, setAvailableChapters] = useState<ChapterMeta[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterMeta | null>(null);

  // Load list of all dataset chapters
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch("/api/dataset/chapters");
        const data = await res.json();
        if (data.success && Array.isArray(data.chapters)) {
          setAvailableChapters(data.chapters);

          // Find current chapter
          let found: ChapterMeta | undefined;
          if (activeChapterId) {
            found = data.chapters.find((c: ChapterMeta) => c.chapter_id === activeChapterId);
          } else if (activeLessonId) {
            // Find by known mapping or lesson id
            const targetChId =
              activeLessonId == 1
                ? "class_6_mathematics_ch01_knowing_our_numbers"
                : activeLessonId == 15
                ? "class_6_general_science_ch01_our_food"
                : activeLessonId == 31
                ? "class_6_social_studies_ch01_reading_and_making_maps"
                : activeLessonId == 47
                ? "class_7_mathematics_ch01_integers"
                : activeLessonId == 62
                ? "class_7_general_science_ch01_general_science"
                : activeLessonId == 78
                ? "class_7_social_studies_ch01_reading_maps_of_different_kind"
                : activeLessonId == 97
                ? "class_8_mathematics_ch01_rational_numbers"
                : activeLessonId == 112
                ? "class_8_general_ch01_graphs_of_motion"
                : activeLessonId == 123
                ? "class_8_social_studies_ch01_reading_and_analysis_of_maps"
                : activeLessonId == 143
                ? "class_9_mathematics_ch01_real_numbers"
                : activeLessonId == 158
                ? "class_9_physical_science_ch01_matter_around_us"
                : activeLessonId == 170
                ? "class_9_biological_science_ch01_cell_structure_and_functions"
                : activeLessonId == 181
                ? "class_9_social_studies_ch01_our_earth"
                : activeLessonId == 203
                ? "class_10_mathematics_ch01_real_numbers"
                : activeLessonId == 217
                ? "class_10_social_studies_ch01_1_india_relief_features"
                : undefined;

            if (targetChId) {
              found = data.chapters.find((c: ChapterMeta) => c.chapter_id === targetChId);
            }
          }

          if (!found && data.chapters.length > 0) {
            found = data.chapters[0];
          }

          if (found) {
            setCurrentChapter(found);
            setActiveChapterId(found.chapter_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch available dataset chapters:", err);
      }
    }
    fetchChapters();
  }, [activeLessonId, activeChapterId]);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = availableChapters.find((c) => c.chapter_id === selectedId);
    if (found) {
      setCurrentChapter(found);
      setActiveChapterId(found.chapter_id);
      setActiveLessonId(undefined);
      router.push(`/student/concept-map?chapter_id=${found.chapter_id}&tab=${activeTab}`);
    }
  };

  const handleTabSwitch = (tab: "mindmap" | "quiz") => {
    setActiveTab(tab);
    const param = activeChapterId
      ? `chapter_id=${activeChapterId}`
      : `lesson_id=${activeLessonId}`;
    router.replace(`/student/concept-map?${param}&tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Navigation Bar & Chapter Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                CHAPTER LEARNING WORKSPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
              {currentChapter ? currentChapter.chapter_title : "Chapter Explorer"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentChapter
                ? `Class ${currentChapter.class} • ${currentChapter.subject} • Chapter ${currentChapter.chapter_number}`
                : "Select a chapter to explore interactive mind maps and authentic textbook quizzes"}
            </p>
          </div>

          {/* Chapter Quick Switcher Dropdown */}
          {availableChapters.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-gray-400 hidden sm:inline">SWITCH CHAPTER:</span>
              <div className="relative">
                <select
                  value={currentChapter?.chapter_id || ""}
                  onChange={handleChapterChange}
                  className="bg-black/50 border border-cyan-500/40 text-cyan-300 rounded-xl px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:border-cyan-400 shadow-neon-cyan appearance-none cursor-pointer max-w-[280px] sm:max-w-[340px] truncate"
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

        {/* SECTION 9: Clear Section Tabs for Mind Map and Chapter Quiz */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => handleTabSwitch("mindmap")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "mindmap"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple border border-purple-400/50"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            }`}
          >
            <GitFork className="w-4 h-4 text-purple-300" />
            <span>🧠 Mind Map</span>
          </button>

          <button
            onClick={() => handleTabSwitch("quiz")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan border border-cyan-400/50"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>🎯 Chapter Quiz</span>
            {currentChapter?.quiz_count ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-400/30 text-cyan-100 ml-1">
                {currentChapter.quiz_count} Qs
              </span>
            ) : null}
          </button>
        </div>

        {/* Tab 1: Mind Map Section */}
        {activeTab === "mindmap" && (
          <div className="space-y-6">
            <ChapterMindMap
              chapterId={activeChapterId}
              lessonId={activeLessonId}
              initialTitle={currentChapter?.chapter_title}
            />

            {/* Also render BKT concepts graph from existing backend if lesson has DB concepts */}
            {activeLessonId && !isNaN(Number(activeLessonId)) && Number(activeLessonId) === 98 && (
              <div className="pt-4 border-t border-white/10">
                <MindMapViewer lessonId={Number(activeLessonId)} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Chapter Quiz Section */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <ChapterQuiz
              chapterId={activeChapterId}
              lessonId={activeLessonId}
              initialChapterTitle={currentChapter?.chapter_title}
            />
          </div>
        )}

        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function ConceptMapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 font-mono">Loading chapter workspace...</div>}>
      <ConceptMapContent />
    </Suspense>
  );
}
