"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Languages,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Zap,
  Info,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";
import ChapterMindMap from "@/components/ChapterMindMap";

interface ConceptNode {
  id: number;
  code: string;
  title_en: string;
  title_te?: string;
  title_hi?: string;
  description_en?: string;
  description_te?: string;
  description_hi?: string;
  order_index: number;
  difficulty: number;
  p_mastery: number;
  status: "Strong" | "Developing" | "Needs Support" | string;
  is_gap: boolean;
}

interface MindMapProps {
  lessonId?: number;
  chapterId?: number;
  onSelectConcept?: (conceptId: number) => void;
}

export default function MindMapViewer({ lessonId = 2, chapterId, onSelectConcept }: MindMapProps) {
  const activeLessonId = lessonId || chapterId || 2;
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [rootGaps, setRootGaps] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [activeLang, setActiveLang] = useState<"en" | "te" | "hi">("en");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [contentCompleted, setContentCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch Lesson Detail and Record Lesson Start
  useEffect(() => {
    async function initLessonMindMap() {
      try {
        setLoading(true);
        // Record lesson start / resume (Section 6: sets in_progress, never marks completed prematurely)
        await fetchFromAPI(`/api/curriculum/lesson/${activeLessonId}/start?user_id=1`, { method: "POST" });

        // Fetch lesson detail
        const detail = await fetchFromAPI(`/api/curriculum/lesson/${activeLessonId}?user_id=1`);
        setLessonDetail(detail);
        if (detail?.progress?.content_completed) {
          setContentCompleted(true);
        }

        // Fetch concept graph
        const mapData = await fetchFromAPI(`/api/mindmap/${activeLessonId}?user_id=1`);
        if (mapData && mapData.nodes && mapData.nodes.length > 0) {
          setNodes(mapData.nodes);
          setRootGaps(mapData.root_cause_gaps || []);
          setSelectedNode(mapData.nodes[0]);
        } else {
          setNodes([]);
          setSelectedNode(null);
        }
      } catch (err) {
        console.warn("Using fallback lesson mind map data:", err);
      } finally {
        setLoading(false);
      }
    }
    initLessonMindMap();
  }, [activeLessonId]);

  const handleSelectNode = async (node: ConceptNode) => {
    setSelectedNode(node);
    if (onSelectConcept) onSelectConcept(node.id);
    // Section 3 & 5: Record concept opened event
    try {
      await fetchFromAPI(
        `/api/curriculum/lesson/${activeLessonId}/concept/${node.id}/view?user_id=1`,
        { method: "POST" }
      );
    } catch (err) {
      console.log("Logged concept view locally");
    }
  };

  const handleCompleteContent = async () => {
    try {
      await fetchFromAPI(`/api/curriculum/lesson/${activeLessonId}/complete-content?user_id=1`, {
        method: "POST",
      });
      setContentCompleted(true);
    } catch (err) {
      setContentCompleted(true);
    }
  };

  const getStatusBadge = (status: string, p: number) => {
    if (status === "Strong" || p >= 0.75) {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        pill: "bg-emerald-500",
        label: "Strong Mastery",
      };
    } else if (status === "Developing" || p >= 0.45) {
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        pill: "bg-amber-500",
        label: "Developing",
      };
    } else {
      return {
        bg: "bg-red-500/10 border-red-500/30 text-red-400",
        pill: "bg-red-500",
        label: "Needs Support",
      };
    }
  };

  const lessonTitle = lessonDetail?.lesson?.title || "Lesson Mind Map";
  const textbookTitle = lessonDetail?.textbook?.title || "Telangana State Board Textbook";

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Spider-Verse Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <GitFork className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
              {textbookTitle} • CHAPTER {lessonDetail?.lesson?.chapter_number || ""}
            </span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {lessonTitle}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Interactive Concept Prerequisite Graph • Bayesian Knowledge Tracing & Dependency Flow
          </p>
        </div>

        {/* Controls: Zoom, Language & Content Completion */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="p-1 rounded text-gray-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-gray-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 rounded text-gray-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            {(["en", "te", "hi"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  activeLang === lang
                    ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "en" ? "EN" : lang === "te" ? "తెలుగు" : "हिन्दी"}
              </button>
            ))}
          </div>

          {/* Mark Content Explored Button (Section 6) */}
          <button
            onClick={handleCompleteContent}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              contentCompleted
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/10 hover:bg-white/15 text-gray-200 border border-white/20"
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{contentCompleted ? "Lesson Content Explored ✓" : "Mark Content Completed"}</span>
          </button>
        </div>
      </div>

      {/* Case 1: Lesson has NO mapped concepts yet in DB -> Render authentic Mind Map from dataset */}
      {nodes.length === 0 && (
        <div className="space-y-4 my-4">
          <ChapterMindMap lessonId={activeLessonId} initialTitle={lessonTitle} />
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href={`/student/concept-map?lesson_id=${activeLessonId}&tab=quiz`}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Take Chapter Quiz</span>
            </Link>
            <Link
              href={`/student/notes?chapter_id=${activeLessonId}`}
              className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 border border-white/10 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Textbook Notes</span>
            </Link>
          </div>
        </div>
      )}

      {/* Case 2: Lesson HAS mapped concepts */}
      {nodes.length > 0 && (
        <>
          {/* Root-Cause Gap Notice */}
          {rootGaps.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/15 via-red-900/10 to-amber-500/10 border border-red-500/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-red-300">
                    Root-Cause Prerequisite Gap Detected
                  </h3>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    Remediation Recommended
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Your difficulty in this chapter stems from an unmastered prerequisite in{" "}
                  <strong className="text-red-400">{rootGaps[0].title_en}</strong> ({Math.round(rootGaps[0].p_mastery * 100)}% Mastery).
                  Resolving this will immediately boost your understanding.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Link
                    href={`/student/quiz?concept_id=${rootGaps[0].concept_id}&mode=remedial`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-semibold transition"
                  >
                    <span>Fix Prerequisite First</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Mind Map Grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
          >
            {/* Concept Timeline Nodes */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
                <span>PREREQUISITE DEPENDENCY FLOW ({nodes.length} CORE CONCEPTS)</span>
                <span>SEQUENTIAL LEARNING PATH</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {nodes.map((node, idx) => {
                  const badge = getStatusBadge(node.status, node.p_mastery);
                  const isSelected = selectedNode?.id === node.id;
                  const title =
                    activeLang === "te" && node.title_te
                      ? node.title_te
                      : activeLang === "hi" && node.title_hi
                      ? node.title_hi
                      : node.title_en;

                  return (
                    <div
                      key={node.id}
                      onClick={() => handleSelectNode(node)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border relative ${
                        isSelected
                          ? "bg-white/10 border-cyan-400 shadow-neon-cyan scale-[1.02]"
                          : "bg-white/5 border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-gray-400 px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          STEP {idx + 1}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-medium flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.pill}`} />
                          <span>{badge.label}</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-gray-100 group-hover:text-cyan-300 line-clamp-1">
                        {title}
                      </h4>

                      {/* Mastery Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span>BKT Mastery Score</span>
                          <span className="font-mono text-cyan-300 font-medium">
                            {Math.round(node.p_mastery * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              node.p_mastery >= 0.75
                                ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                                : node.p_mastery >= 0.45
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                : "bg-gradient-to-r from-red-500 to-rose-400"
                            }`}
                            style={{ width: `${Math.round(node.p_mastery * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Node Deep-Dive Drawer (Sections 3 & 4) */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-4 backdrop-blur-md">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      {selectedNode.code}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border ${
                        getStatusBadge(selectedNode.status, selectedNode.p_mastery).bg
                      }`}
                    >
                      {getStatusBadge(selectedNode.status, selectedNode.p_mastery).label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {activeLang === "te" && selectedNode.title_te
                        ? selectedNode.title_te
                        : activeLang === "hi" && selectedNode.title_hi
                        ? selectedNode.title_hi
                        : selectedNode.title_en}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mt-2">
                      {activeLang === "te" && selectedNode.description_te
                        ? selectedNode.description_te
                        : activeLang === "hi" && selectedNode.description_hi
                        ? selectedNode.description_hi
                        : selectedNode.description_en}
                    </p>
                  </div>

                  {/* BKT Parameter Transparency Box */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-gray-400 font-mono">
                    <div className="flex justify-between">
                      <span>BKT Mastery Probability:</span>
                      <span className="text-cyan-300 font-semibold">{Math.round(selectedNode.p_mastery * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty Parameter:</span>
                      <span className="text-gray-300">{Math.round(selectedNode.difficulty * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prerequisite Status:</span>
                      <span className={selectedNode.is_gap ? "text-red-400 font-bold" : "text-emerald-400"}>
                        {selectedNode.is_gap ? "Prerequisite Gap Detected" : "Satisfied"}
                      </span>
                    </div>
                  </div>

                  {/* Section 4: Practice Specific Concept Directly from Node */}
                  <div className="pt-2 space-y-2">
                    <Link
                      href={`/student/quiz?concept_id=${selectedNode.id}&chapter_id=${activeLessonId}&mode=adaptive`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-neon-cyan transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Practice This Specific Concept</span>
                    </Link>

                    <Link
                      href={`/student/quiz?chapter_id=${activeLessonId}&mode=adaptive`}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs border border-white/10 transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Start Lesson-Wide Practice</span>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
