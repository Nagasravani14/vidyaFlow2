"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AICoachChatbot from "@/components/AICoachChatbot";
import {
  BookOpen,
  GitFork,
  Sparkles,
  ChevronRight,
  Layers,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function MyLearningPage() {
  const [selectedClass, setSelectedClass] = useState<number>(8);
  const [selectedBoard, setSelectedBoard] = useState<string>("telangana");
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathematics");
  const [availableClasses, setAvailableClasses] = useState<number[]>([6, 7, 8, 9, 10]);
  const [availableBoards, setAvailableBoards] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [selectedTextbook, setSelectedTextbook] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load Classes and Boards from Backend
  useEffect(() => {
    async function loadMeta() {
      try {
        const classRes = await fetchFromAPI("/api/curriculum/classes");
        if (classRes?.classes) setAvailableClasses(classRes.classes);

        const boardRes = await fetchFromAPI(`/api/curriculum/boards?grade_level=${selectedClass}`);
        if (boardRes) setAvailableBoards(boardRes);
      } catch (err) {
        console.warn("Using fallback metadata:", err);
      }
    }
    loadMeta();
  }, [selectedClass]);

  // 2. Load Subjects for selected Class and Board from Backend
  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const subjRes = await fetchFromAPI(
          `/api/curriculum/subjects?grade_level=${selectedClass}&board=${selectedBoard}`
        );
        if (subjRes && subjRes.length > 0) {
          setAvailableSubjects(subjRes);
          // Keep current subject if available, otherwise switch to first available
          const found = subjRes.find((s: any) => s.name === selectedSubject && s.is_available);
          if (!found) {
            const firstAvailable = subjRes.find((s: any) => s.is_available);
            setSelectedSubject(firstAvailable ? firstAvailable.name : subjRes[0].name);
          }
        }
      } catch (err) {
        console.warn("Using fallback subjects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [selectedClass, selectedBoard]);

  // 3. Load Textbooks for selected Subject from Backend
  useEffect(() => {
    async function loadTextbooks() {
      try {
        setLoading(true);
        const tbRes = await fetchFromAPI(
          `/api/curriculum/textbooks?grade_level=${selectedClass}&board=${selectedBoard}&subject=${encodeURIComponent(
            selectedSubject
          )}`
        );
        if (tbRes && tbRes.length > 0) {
          setTextbooks(tbRes);
          setSelectedTextbook(tbRes[0]);
        } else {
          setTextbooks([]);
          setSelectedTextbook(null);
          setLessons([]);
        }
      } catch (err) {
        console.warn("Using fallback textbooks:", err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedSubject) {
      loadTextbooks();
    }
  }, [selectedClass, selectedBoard, selectedSubject]);

  // 4. Load All Lessons for selected Textbook from Backend
  useEffect(() => {
    async function loadLessons() {
      if (!selectedTextbook?.id) return;
      try {
        setLoading(true);
        const res = await fetchFromAPI(`/api/curriculum/textbooks/${selectedTextbook.id}/lessons?user_id=1`);
        if (res?.lessons) {
          setLessons(res.lessons);
        }
      } catch (err) {
        console.warn("Using fallback lessons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLessons();
  }, [selectedTextbook]);

  const activeSubjectObj = availableSubjects.find((s) => s.name === selectedSubject);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Header Bar */}
        <div className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              AUTHENTIC STATE & CENTRAL BOARD CURRICULUM DISCOVERY
            </span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            My Learning — Textbook & Lesson Explorer
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Select Class → Board → Subject → Textbook → View All Lessons. Every lesson opens with an interactive Mind Map.
          </p>
        </div>

        {/* STEP 1 & 2: Select Class & Board Navigation Bar */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Class Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 mr-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>SELECT CLASS:</span>
              </span>
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedClass === cls
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-neon-cyan"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Board Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-gray-400">CURRICULUM BOARD:</span>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="telangana">Telangana State Board (SCERT EM 2026-27)</option>
                <option value="cbse">CBSE (NCERT)</option>
                <option value="icse">ICSE (CISCE)</option>
              </select>
            </div>
          </div>

          {/* STEP 3: Subject Tabs */}
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-gray-400 mr-1 shrink-0">SUBJECTS:</span>
            {availableSubjects.map((sub) => {
              const isActive = selectedSubject === sub.name;
              return (
                <button
                  key={sub.name}
                  onClick={() => setSelectedSubject(sub.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? "bg-white/15 border border-cyan-400 text-cyan-300 shadow-neon-cyan"
                      : sub.is_available
                      ? "bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10"
                      : "bg-white/[0.02] border border-white/5 text-gray-500 opacity-60"
                  }`}
                >
                  <span>{sub.name}</span>
                  {sub.is_available ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                      {sub.lesson_count} Lessons
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      Missing in Dataset
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Missing Dataset Warning Notice (Honest reporting per Section 1) */}
        {activeSubjectObj && !activeSubjectObj.is_available && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Authentic Dataset Status Note</h4>
              <p>{activeSubjectObj.missing_reason}</p>
              <p className="text-gray-400 mt-1">
                VidyaFlow adheres strictly to the existing files in dataset_textbooks/ as the single source of truth without fabricating textbooks.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Selected Textbook Card */}
        {selectedTextbook && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0B0F19] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-neon-cyan text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  AUTHENTIC TEXTBOOK SOURCE
                </span>
                <h3 className="text-lg font-bold text-white">{selectedTextbook.title}</h3>
                <p className="text-xs text-gray-400 font-mono">
                  File: {selectedTextbook.filename} • {selectedTextbook.total_pages} Pages • {selectedTextbook.lesson_count} Total Chapters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                100% Ingested from dataset_textbooks
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: All Lessons List — Click opens Mind Map First! */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>All Textbook Lessons ({lessons.length} Chapters)</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">CLICK ANY LESSON TO OPEN INTERACTIVE MIND MAP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const isCompleted = lesson.status === "completed";
              const isInProgress = lesson.status === "in_progress";

              return (
                <Link
                  key={lesson.id}
                  href={`/student/concept-map?lesson_id=${lesson.id}`}
                  className="group p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/60 hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-neon-cyan relative"
                >
                  <div>
                    {/* Top indicators */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-cyan-400 border border-white/5">
                        CHAPTER {lesson.chapter_number}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : isInProgress
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-white/5 text-gray-400 border-white/10"
                        }`}
                      >
                        {isCompleted ? "COMPLETED" : isInProgress ? "IN PROGRESS" : "NOT STARTED"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2 mb-2">
                      {lesson.title}
                    </h3>

                    <p className="text-[11px] text-gray-400 font-mono mb-3">{lesson.pages_display}</p>

                    <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                      {lesson.has_mindmap ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          <span>Mind Map Ready ({lesson.concepts_count} Concepts)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                          Mind Map Preparing
                        </span>
                      )}

                      {lesson.has_practice ? (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Practice Ready</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Bottom launch pill */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">
                    <span>Open Interactive Mind Map</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}
