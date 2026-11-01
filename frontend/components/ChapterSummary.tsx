"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  CheckCircle2,
  Copy,
  RotateCcw,
  Check,
  Grid,
  Info,
  Hash,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { WHOLE_NUMBERS_MOCK_DATA, WholeNumbersNotesData } from "@/lib/mockWholeNumbersNotes";

interface ChapterSummaryProps {
  chapterId?: number | string;
  initialChapterTitle?: string;
}

export default function ChapterSummary({
  chapterId = 2,
  initialChapterTitle,
}: ChapterSummaryProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "formulas" | "definitions" | "flashcards">("summary");
  const [notesData, setNotesData] = useState<WholeNumbersNotesData>(WHOLE_NUMBERS_MOCK_DATA);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [reviewedCards, setReviewedCards] = useState<Record<string, boolean>>({});

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    const cardId = notesData.flashcards[currentFlashcardIndex]?.id;
    if (cardId) {
      setReviewedCards((prev) => ({ ...prev, [cardId]: true }));
    }
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev < notesData.flashcards.length - 1 ? prev + 1 : 0));
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev > 0 ? prev - 1 : notesData.flashcards.length - 1));
  };

  const handleResetFlashcards = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex(0);
    setReviewedCards({});
  };

  const currentCard = notesData.flashcards[currentFlashcardIndex];
  const flashcardProgressPercent = notesData.flashcards.length > 0
    ? Math.round(((currentFlashcardIndex + 1) / notesData.flashcards.length) * 100)
    : 0;

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative space-y-6">
      {/* Spider-Verse Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>{notesData.board.toUpperCase()}</span>
            <span>•</span>
            <span>CLASS {notesData.class}</span>
            <span>•</span>
            <span>CHAPTER {notesData.chapter_number}</span>
            <span>•</span>
            <span className="text-purple-300 font-semibold">{notesData.subject}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {notesData.title} — Notes & Summaries
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Authentic curriculum study notes, verified algebraic formulas, core definitions, and active recall flashcards.
          </p>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            Class 8 SCERT Curriculum
          </span>
        </div>
      </div>

      {/* SECTION 6: Tabs navigation for AI Summary, Key Formulas, Definitions, and Flashcards */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-1">
        {[
          { id: "summary", label: "AI Summary", icon: FileText, count: null },
          { id: "formulas", label: "Key Formulas", icon: Sparkles, count: notesData.formulas.length },
          { id: "definitions", label: "Definitions", icon: BookOpen, count: notesData.definitions.length },
          { id: "flashcards", label: "Flashcards", icon: Layers, count: notesData.flashcards.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/40 to-cyan-600/40 text-cyan-300 border border-cyan-400/50 shadow-neon-cyan"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-cyan-500/30 text-cyan-200" : "bg-white/10 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: AI Summary */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Main Meaning & Number Line Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-[#0B0F19] border border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>CORE CONCEPT: MEANING & NUMBER LINE</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>1. Meaning of Whole Numbers</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  W = &#123;0, 1, 2, 3, ...&#125;
                </span>
              </h3>
              <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
                {notesData.summary.meaning}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <h4 className="text-sm font-semibold text-cyan-300 mb-1.5">
                2. Number Line Representation
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {notesData.summary.number_line}
              </p>

              {/* Visual Number Line Diagram */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Horizontal Number Line Ray
                </span>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 overflow-x-auto py-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="flex flex-col items-center min-w-[28px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mb-1 shadow-neon-cyan" />
                      <span className="font-bold">{num}</span>
                    </div>
                  ))}
                  <div className="text-gray-400 text-xs pl-2 font-mono">⟶ (Indefinite)</div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-mono border-t border-white/5">
                  <span>◀ Left = Subtraction</span>
                  <span>Origin = 0</span>
                  <span>Right = Addition ▶</span>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span>Core Mathematical Properties of Whole Numbers</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Closure Property Card */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cyan-300">Closure Property</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Closed under +, ×
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {notesData.summary.closure}
                </p>
              </div>

              {/* Commutative Property Card */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-300">Commutative Property</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    a + b = b + a
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {notesData.summary.commutative}
                </p>
              </div>

              {/* Associative Property Card */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-300">Associative Property</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    (a + b) + c = a + (b + c)
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {notesData.summary.associative}
                </p>
              </div>

              {/* Distributive Property Card */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/40 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-300">Distributive Property</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    a × (b + c) = ab + ac
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {notesData.summary.distributive}
                </p>
              </div>
            </div>
          </div>

          {/* Identity Elements & Important Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Identity Elements (0 & 1)</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {notesData.summary.identities}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Important Textbook Examples</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {notesData.summary.examples}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Key Formulas */}
      {activeTab === "formulas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Click any copy icon to copy the formula directly to your clipboard.
            </p>
            <span className="text-xs font-mono text-cyan-400">
              {notesData.formulas.length} Core Formulas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesData.formulas.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition group relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">{item.name}</span>
                  <button
                    onClick={() => handleCopy(item.formula)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition"
                    title="Copy formula"
                  >
                    {copiedFormula === item.formula ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Mathematical Formula Box */}
                <div className="py-3 px-4 rounded-xl bg-black/60 border border-white/10 font-mono text-cyan-300 text-sm md:text-base font-bold tracking-wide text-center shadow-inner">
                  {item.formula}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>

                {/* Numerical Example Box */}
                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs flex items-start gap-2">
                  <span className="font-mono text-purple-400 font-bold shrink-0">E.g.</span>
                  <span className="text-gray-300 font-mono">{item.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Definitions */}
      {activeTab === "definitions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Fundamental terminology and definitions for Class 8 Whole Numbers.
            </p>
            <span className="text-xs font-mono text-cyan-400">
              {notesData.definitions.length} Standard Terms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notesData.definitions.map((d, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Term #{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{d.term}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{d.definition}</p>
                </div>

                {/* Numerical Example */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-purple-300 uppercase block mb-1">
                    Textbook Example
                  </span>
                  <p className="text-xs text-gray-400 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    {d.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Interactive Flashcards */}
      {activeTab === "flashcards" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Header controls & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                ACTIVE RECALL STUDY
              </span>
              <p className="text-xs text-gray-400">
                Tap card to reveal answer • Test your memory before final quizzes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "carousel" ? "grid" : "carousel")}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition flex items-center gap-1.5"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{viewMode === "carousel" ? "View All Grid" : "Focus Carousel"}</span>
              </button>

              <button
                onClick={handleResetFlashcards}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
                title="Reset flashcard progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {viewMode === "carousel" ? (
            <div className="space-y-4">
              {/* Progress Bar & Counter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">
                    Flashcard {currentFlashcardIndex + 1} of {notesData.flashcards.length}
                  </span>
                  <span className="text-cyan-300 font-bold">{flashcardProgressPercent}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                    style={{ width: `${flashcardProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Interactive Flipping Card */}
              <div
                onClick={handleFlip}
                className={`min-h-[240px] p-8 rounded-3xl cursor-pointer border transition-all duration-300 flex flex-col justify-between shadow-2xl relative select-none ${
                  isFlipped
                    ? "bg-gradient-to-br from-purple-950/60 via-indigo-950/50 to-[#0B0F19] border-cyan-400 shadow-neon-cyan"
                    : "bg-gradient-to-br from-white/10 via-white/5 to-[#0B0F19] border-white/20 hover:border-cyan-400/60 hover:scale-[1.01]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-cyan-300">
                      {isFlipped ? "ANSWER / EXPLANATION" : "QUESTION / PROMPT"}
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{isFlipped ? "CLICK TO SHOW QUESTION" : "CLICK TO FLIP"}</span>
                    </span>
                  </div>

                  <h3 className="text-base md:text-xl font-bold text-white leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </h3>

                  {!isFlipped && currentCard.hint && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Hint: {currentCard.hint}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {isFlipped ? "Solution revealed ✓" : "Active recall question"}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isFlipped ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"
                    }`}
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevFlashcard}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Dots indicator */}
                <div className="hidden sm:flex items-center gap-1 max-w-[240px] overflow-x-auto py-1">
                  {notesData.flashcards.map((card, idx) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentFlashcardIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentFlashcardIndex
                          ? "w-4 bg-cyan-400"
                          : reviewedCards[card.id]
                          ? "bg-emerald-400"
                          : "bg-white/20"
                      }`}
                      title={`Card ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextFlashcard}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-neon-cyan"
                >
                  <span>Next Card</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notesData.flashcards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>FLASHCARD #{idx + 1}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-gray-400 uppercase mb-1">Question</h4>
                    <p className="text-sm font-semibold text-white">{card.front}</p>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-xs font-mono text-emerald-400 uppercase mb-1">Answer</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
