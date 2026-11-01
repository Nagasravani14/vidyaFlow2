"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  Languages,
  BookOpen,
  GitFork,
  Award,
  AlertCircle,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: number;
  concept_id: number;
  concept_code: string;
  concept_title: string;
  chapter_id: number;
  question_text_en: string;
  question_text_te?: string;
  question_text_hi?: string;
  options: QuestionOption[];
  difficulty: string;
  is_challenge: boolean;
  is_remedial: boolean;
  hint_level_1?: string;
  hint_level_2?: string;
  hint_level_3?: string;
}

interface QuizEngineProps {
  conceptId?: number;
  chapterId?: number;
  mode?: "adaptive" | "challenge" | "remedial" | "diagnostic";
}

export default function QuizEngine({
  conceptId,
  chapterId = 2,
  mode = "adaptive",
}: QuizEngineProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [hintContent, setHintContent] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "te" | "hi">("en");
  const [loading, setLoading] = useState(true);

  // Load questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        let url = `/api/quiz/questions?chapter_id=${chapterId}&mode=${mode}`;
        if (conceptId) {
          url += `&concept_id=${conceptId}`;
        }
        const data = await fetchFromAPI(url);
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.warn("Quiz questions query error:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [chapterId, conceptId, mode]);

  const currentQ = questions[currentIndex];

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitted || !currentQ) return;

    // Generate unique idempotency key to prevent double submission
    const idempotencyKey = `attempt_q${currentQ.id}_u1_${Date.now()}`;

    try {
      const res = await fetchFromAPI("/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          user_id: 1,
          question_id: currentQ.id,
          selected_option: selectedOption,
          time_taken_sec: 25,
          language: language,
          idempotency_key: idempotencyKey,
        }),
      });
      setSubmissionResult(res);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleRequestHint = async (level: number) => {
    if (!currentQ) return;
    try {
      setActiveHintLevel(level);
      const res = await fetchFromAPI("/api/quiz/hint", {
        method: "POST",
        body: JSON.stringify({
          question_id: currentQ.id,
          hint_level: level,
          language: language,
        }),
      });
      setHintContent(res.content);
    } catch (err) {
      if (level === 1) {
        setHintContent(currentQ.hint_level_1 || "Identify variable vs constants.");
      } else if (level === 2) {
        setHintContent(currentQ.hint_level_2 || "Group all variable terms on the LHS.");
      } else {
        setHintContent(currentQ.hint_level_3 || "Isolate x: ax = c - b.");
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setSubmissionResult(null);
    setActiveHintLevel(0);
    setHintContent(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading validated practice items...</div>;
  }

  // Section 4 Requirement: If a concept does not have validated questions, show a clear unavailable state rather than unrelated questions!
  if (!currentQ || questions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Validated Practice Questions Available</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Questions for this specific concept node are currently being verified from the textbook curriculum.
          VidyaFlow strictly displays validated questions and avoids serving unrelated questions.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href={`/student/concept-map?chapter_id=${chapterId}`}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1.5"
          >
            <GitFork className="w-4 h-4" />
            <span>Return to Lesson Mind Map</span>
          </Link>
          <Link
            href={`/student/notes?chapter_id=${chapterId}`}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Lesson Notes</span>
          </Link>
        </div>
      </div>
    );
  }

  const qText =
    language === "te" && currentQ.question_text_te
      ? currentQ.question_text_te
      : language === "hi" && currentQ.question_text_hi
      ? currentQ.question_text_hi
      : currentQ.question_text_en;

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Spider-Verse Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] uppercase tracking-wider">
              {mode.toUpperCase()} PRACTICE ENGINE
            </span>
            <span className="text-xs text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{currentQ.concept_title}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-normal">
              {currentQ.difficulty.toUpperCase()}
            </span>
          </h2>
        </div>

        {/* Controls: Language and Return to Mind Map */}
        <div className="flex items-center gap-2">
          <Link
            href={`/student/concept-map?chapter_id=${chapterId}`}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs flex items-center gap-1.5 transition"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mind Map</span>
          </Link>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            {(["en", "te", "hi"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  language === lang
                    ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "en" ? "EN" : lang === "te" ? "తెలుగు" : "हिन्दी"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Text Box */}
      <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 relative z-10">
        <p className="text-base font-semibold text-gray-100 leading-relaxed">{qText}</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6 relative z-10">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          let optStyle = "bg-white/5 border-white/10 hover:border-cyan-500/40 text-gray-200";

          if (isSubmitted && submissionResult) {
            if (opt.id === submissionResult.correct_answer) {
              optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-neon-emerald";
            } else if (isSelected && !submissionResult.is_correct) {
              optStyle = "bg-red-500/20 border-red-500 text-red-200";
            }
          } else if (isSelected) {
            optStyle = "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-neon-cyan";
          }

          return (
            <button
              key={opt.id}
              disabled={isSubmitted}
              onClick={() => setSelectedOption(opt.id)}
              className={`p-4 rounded-xl text-left border font-medium text-sm transition-all duration-200 flex items-center gap-3 ${optStyle}`}
            >
              <span className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono font-bold">
                {opt.id}
              </span>
              <span className="flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Progressive Hints Section */}
      <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Lightbulb className="w-4 h-4" />
            <span>Progressive Socratic Hints</span>
          </div>
          <span className="text-[10px] text-gray-400">Never reveals answer directly</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { level: 1, label: "Level 1: Conceptual Nudge" },
            { level: 2, label: "Level 2: Step Breakdown" },
            { level: 3, label: "Level 3: Key Formula / Rule" },
          ].map((h) => (
            <button
              key={h.level}
              onClick={() => handleRequestHint(h.level)}
              disabled={isSubmitted}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                activeHintLevel === h.level
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-neon-cyan"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {hintContent && (
          <div className="mt-3 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed animate-fadeIn">
            {hintContent}
          </div>
        )}
      </div>

      {/* Action Buttons: Submit / Next */}
      {!isSubmitted ? (
        <div className="flex justify-end relative z-10">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-neon-cyan hover:scale-[1.02] disabled:opacity-40 transition-all"
          >
            Submit Answer & Update BKT Mastery
          </button>
        </div>
      ) : (
        /* Real-Time BKT Result & Dynamic Branching Box */
        <div className="space-y-4 relative z-10 animate-fadeIn">
          <div
            className={`p-5 rounded-2xl border ${
              submissionResult.is_correct
                ? "bg-emerald-950/30 border-emerald-500/40 shadow-neon-emerald"
                : "bg-red-950/30 border-red-500/40"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {submissionResult.is_correct ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {submissionResult.is_correct ? "Correct! Excellent Step Execution" : "Not Quite — Review the Rule"}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">{submissionResult.explanation}</p>
              </div>
            </div>

            {/* BKT Mastery Meter */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">PREVIOUS BKT SCORE</span>
                <span className="text-gray-200 font-bold text-sm">
                  {Math.round(submissionResult.prior_p_mastery * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">UPDATED BKT MASTERY</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {Math.round(submissionResult.updated_p_mastery * 100)}% ({submissionResult.mastery_status})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">KNOWLEDGE DELTA</span>
                <span
                  className={`font-bold text-sm ${
                    submissionResult.delta_mastery >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {submissionResult.delta_mastery >= 0 ? `+${Math.round(submissionResult.delta_mastery * 100)}%` : `${Math.round(submissionResult.delta_mastery * 100)}%`}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">LESSON PROGRESS</span>
                <span className="text-purple-300 font-bold text-sm">
                  {submissionResult.lesson_progress?.score_percent || 0}% ({submissionResult.lesson_progress?.status || "in_progress"})
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Branching Card */}
          {submissionResult.next_action && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-200">
                      AI Dynamic Branching: {submissionResult.next_action.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-purple-500/20 text-purple-300">
                      {submissionResult.next_action.branch || "Adaptive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">{submissionResult.next_action.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-neon-cyan hover:scale-105 transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
