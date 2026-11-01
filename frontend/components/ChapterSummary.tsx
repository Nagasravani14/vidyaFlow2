"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  RotateCw,
  Languages,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Formula {
  name: string;
  formula: string;
  description: string;
}

interface Definition {
  term: string;
  definition_en: string;
  definition_te?: string;
  definition_hi?: string;
}

interface Flashcard {
  id: string;
  front: string;
  front_te?: string;
  back: string;
  back_te?: string;
}

interface ChapterSummaryProps {
  chapterId?: number;
}

export default function ChapterSummary({ chapterId = 2 }: ChapterSummaryProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "formulas" | "definitions" | "flashcards">("summary");
  const [activeLang, setActiveLang] = useState<"en" | "te" | "hi">("en");
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const data = await fetchFromAPI(`/api/textbooks/summary/${chapterId}`);
        setChapter(data);
      } catch (err) {
        console.warn("Using fallback local summary:", err);
        setChapter({
          id: 2,
          title: "Linear Equations in One Variable",
          chapter_number: 3,
          board: "Telangana State Board",
          grade_level: 8,
          summary_en:
            "A linear equation in one variable is an algebraic equation of degree 1 having only one unknown variable. It represents an equality between two mathematical expressions (LHS = RHS). The value of the variable that satisfies the equation is called its solution or root. To solve it, we apply inverse arithmetic operations uniformly to both sides or transpose terms across the equality sign (changing '+' to '-', and '×' to '÷').",
          summary_te:
            "ఒక చలరాశిలో ఏకఘాత సమీకరణం అనేది గరిష్ట ఘాతం 1 కలిగిన ఒకే ఒక తెలియని చలరాశి ఉన్న బీజగణిత సమీకరణం. ఇది రెండు సమాసాల మధ్య సమానత్వాన్ని (LHS = RHS) సూచిస్తుంది. సమీకరణాన్ని తృప్తిపరిచే చలరాశి విలువను దాని సాధన లేదా మూలం అంటారు.",
          summary_hi:
            "एक चर वाले रैखिक समीकरण ऐसे बीजीय समीकरण होते हैं जिनमें केवल एक अज्ञात चर होता है और उसकी अधिकतम घात 1 होती है। यह दो व्यंजकों के बीच समानता (LHS = RHS) को दर्शाता है। चर का वह मान जो समीकरण को संतुष्ट करता है, उसका हल कहलाता है।",
          formulas: [
            {
              name: "Standard Form",
              formula: "ax + b = 0  (where a ≠ 0)",
              description: "Standard representation of a linear equation in one variable x.",
            },
            {
              name: "General Solution Formula",
              formula: "x = -b / a",
              description: "Direct algebraic root for standard form.",
            },
            {
              name: "Variables on Both Sides",
              formula: "ax + b = cx + d  ⟹  (a - c)x = d - b",
              description: "Transposition rule collecting variables on LHS and constants on RHS.",
            },
          ],
          definitions: [
            {
              term: "Linear Equation",
              definition_en: "An algebraic equation where the highest exponent of the variable is 1.",
              definition_te: "చలరాశి యొక్క గరిష్ట ఘాతం 1 గా గల బీజీయ సమీకరణాన్ని ఏకఘాత సమీకరణం అంటారు.",
              definition_hi: "वह बीजीय समीकरण जिसमें चर की अधिकतम घात 1 हो, रैखिक समीकरण कहलाता है।",
            },
            {
              term: "Transposition",
              definition_en: "Moving a term from one side of an equation to the other while reversing its mathematical sign.",
              definition_te: "సమీకరణంలో ఒక పదాన్ని ఒక వైపు నుండి రెండవ వైపునకు గుర్తు మార్పుతో తరలించడాన్ని పక్షాంతరం అంటారు.",
              definition_hi: "समीकरण के किसी पद को एक पक्ष से दूसरे पक्ष में उसका चिन्ह बदलकर ले जाना पक्षान्तरण कहलाता है।",
            },
          ],
          flashcards: [
            {
              id: "fc1",
              front: "What happens to the sign of a term when it transposes across '='?",
              front_te: "'=' గుర్తు దాటి ఒక పదం పక్షాంతరం చెందినప్పుడు దాని గుర్తు ఏమవుతుంది?",
              back: "It inverts: '+' becomes '-', '-' becomes '+', '×' becomes '÷', and '÷' becomes '×'.",
              back_te: "చిహ్నం వ్యతిరేకం అవుతుంది: '+' ఉంటే '-' అవుతుంది, '×' ఉంటే '÷' అవుతుంది.",
            },
            {
              id: "fc2",
              front: "If 2x + 7 = 15, what is the first step to isolate x?",
              front_te: "2x + 7 = 15 సమీకరణంలో x ని వేరు చేయడానికి మొదటి దశ ఏమిటి?",
              back: "Subtract 7 from both sides: 2x = 15 - 7 = 8.",
              back_te: "ఇరువైపులా 7 ను తీసివేయండి: 2x = 15 - 7 = 8.",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [chapterId]);

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  if (!chapter) {
    return <div className="p-8 text-center text-gray-400">Loading textbook summary...</div>;
  }

  const currentSummary =
    activeLang === "te" && chapter.summary_te
      ? chapter.summary_te
      : activeLang === "hi" && chapter.summary_hi
      ? chapter.summary_hi
      : chapter.summary_en;

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl relative">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>{chapter.board?.toUpperCase() || "TELANGANA"}</span>
            <span>•</span>
            <span>CLASS {chapter.grade_level || 8}</span>
            <span>•</span>
            <span>CHAPTER {chapter.chapter_number || 3}</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {chapter.title}
          </h2>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
          {(["en", "te", "hi"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeLang === lang
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {lang === "en" ? "English" : lang === "te" ? "తెలుగు" : "हिन्दी"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto pb-1">
        {[
          { id: "summary", label: "AI Summary", icon: FileText },
          { id: "formulas", label: `Key Formulas (${chapter.formulas?.length || 0})`, icon: Sparkles },
          { id: "definitions", label: `Definitions (${chapter.definitions?.length || 0})`, icon: BookOpen },
          { id: "flashcards", label: `Flashcards (${chapter.flashcards?.length || 0})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? "bg-white/10 text-cyan-300 border border-cyan-500/50 shadow-neon-cyan"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Summary */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 leading-relaxed text-sm text-gray-200">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI SYNTHESIZED CHAPTER CORE (DATASET TEXTBOOKS INGESTION)</span>
            </div>
            <p className="whitespace-pre-line text-gray-200 leading-relaxed font-normal">
              {currentSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
              <h4 className="font-semibold text-cyan-300 mb-1">Prerequisite Required</h4>
              <p className="text-gray-300">Integer Operations & Sign Rules (-14 - (-9) = -5)</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <h4 className="font-semibold text-purple-300 mb-1">Target Proficiency</h4>
              <p className="text-gray-300">Degree 1 Single-Variable Isolation & Word Problems</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <h4 className="font-semibold text-emerald-300 mb-1">Next Step</h4>
              <p className="text-gray-300">Linear Equations with Variables on Both Sides</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Key Formulas */}
      {activeTab === "formulas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(chapter.formulas || []).map((f: Formula, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">{f.name}</span>
                <button
                  onClick={() => handleCopy(f.formula)}
                  className="p-1 rounded text-gray-400 hover:text-cyan-300 transition"
                  title="Copy formula"
                >
                  {copiedFormula === f.formula ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Math Display Card */}
              <div className="py-3 px-4 rounded-xl bg-black/50 border border-white/10 font-mono text-cyan-300 text-sm tracking-wide text-center my-2 shadow-inner">
                {f.formula}
              </div>

              <p className="text-xs text-gray-400 mt-2 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Definitions */}
      {activeTab === "definitions" && (
        <div className="space-y-3">
          {(chapter.definitions || []).map((d: Definition, idx: number) => {
            const defText =
              activeLang === "te" && d.definition_te
                ? d.definition_te
                : activeLang === "hi" && d.definition_hi
                ? d.definition_hi
                : d.definition_en;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition"
              >
                <h4 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <span>{d.term}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                    Term #{idx + 1}
                  </span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">{defText}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Interactive Flashcards */}
      {activeTab === "flashcards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(chapter.flashcards || []).map((card: Flashcard, idx: number) => {
            const isFlipped = flippedCards[card.id];
            const frontText = activeLang === "te" && card.front_te ? card.front_te : card.front;
            const backText = activeLang === "te" && card.back_te ? card.back_te : card.back;

            return (
              <div
                key={card.id || idx}
                onClick={() => toggleCard(card.id)}
                className={`min-h-[180px] p-5 rounded-2xl cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                  isFlipped
                    ? "bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border-cyan-400 shadow-neon-cyan"
                    : "bg-white/5 border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-3">
                    <span>FLASHCARD #{idx + 1}</span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <RotateCw className="w-3 h-3" />
                      <span>{isFlipped ? "ANSWER" : "TAP TO FLIP"}</span>
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {isFlipped ? backText : frontText}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">
                    {isFlipped ? "Solution revealed" : "Active recall test"}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isFlipped ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
