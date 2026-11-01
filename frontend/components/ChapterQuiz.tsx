"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Check,
  Languages,
} from "lucide-react";
import {
  QuizLanguage,
  QUIZ_UI_TEXT,
  translateQuizQuestion,
} from "@/lib/quizTranslations";

interface QuizOption {
  id: string;
  text: string;
}

interface Question {
  question_id: string;
  chapter_id: string;
  concept_id?: string;
  question: string;
  options: QuizOption[];
  difficulty?: string;
  source_page?: number;
}

interface CheckResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
}

interface ChapterQuizProps {
  chapterId?: string;
  lessonId?: number | string;
  initialChapterTitle?: string;
  onComplete?: (score: number, total: number) => void;
}

export default function ChapterQuiz({
  chapterId,
  lessonId,
  initialChapterTitle,
  onComplete,
}: ChapterQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapterTitle, setChapterTitle] = useState<string>(initialChapterTitle || "");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, CheckResult>>({});
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Multilingual Quiz State: English, Telugu, Hindi
  const [language, setLanguage] = useState<QuizLanguage>("en");

  // Load language preference from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("vf_quiz_lang");
      if (savedLang === "te" || savedLang === "hi" || savedLang === "en") {
        setLanguage(savedLang);
      }
    }
  }, []);

  const handleLanguageChange = (newLang: QuizLanguage) => {
    setLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("vf_quiz_lang", newLang);
    }
  };

  const ui = QUIZ_UI_TEXT[language] || QUIZ_UI_TEXT.en;

  // Load chapter questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        setErrorMsg(null);
        setIsCompleted(false);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setResults({});

        const params = new URLSearchParams();
        if (chapterId) params.set("chapter_id", chapterId);
        if (lessonId) params.set("lesson_id", String(lessonId));

        const res = await fetch(`/api/dataset/quiz?${params.toString()}`);
        const data = await res.json();

        if (data.available && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          setChapterTitle(data.chapter_title || initialChapterTitle || "Chapter Quiz");
        } else {
          setQuestions([]);
          setErrorMsg(data.message || "Quiz is not available for this chapter yet.");
        }
      } catch (err: any) {
        console.error("Failed to fetch chapter quiz:", err);
        setErrorMsg("Quiz is not available for this chapter yet.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    if (chapterId || lessonId) {
      fetchQuiz();
    }
  }, [chapterId, lessonId, initialChapterTitle]);

  const currentQ = questions[currentIndex];
  const translatedQ = currentQ ? translateQuizQuestion(currentQ, language) : null;

  const currentSelected = selectedAnswers[currentIndex] || null;
  const currentResult = results[currentIndex] || null;
  const isCurrentChecked = Boolean(currentResult);

  const handleSelectOption = (optionId: string) => {
    if (isCurrentChecked) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  const handleCheckAnswer = async () => {
    if (!currentQ || !currentSelected || isChecking || isCurrentChecked) return;

    try {
      setIsChecking(true);
      const res = await fetch("/api/dataset/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: currentQ.chapter_id,
          question_id: currentQ.question_id,
          selected_option: currentSelected,
          lesson_id: lessonId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Translate explanation to target language if available
        const explTranslated = translatedQ?.explanation || data.explanation;

        setResults((prev) => ({
          ...prev,
          [currentIndex]: {
            is_correct: data.is_correct,
            correct_answer: data.correct_answer,
            explanation: explTranslated,
          },
        }));
      }
    } catch (err) {
      console.error("Error checking answer:", err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        const correctCount = Object.values(results).filter((r) => r.is_correct).length;
        onComplete(correctCount, questions.length);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setResults({});
    setIsCompleted(false);
  };

  // Metrics
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.is_correct).length;
  const incorrectCount = answeredCount - correctCount;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const finalScorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="glass-card p-10 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">Loading chapter quiz from dataset...</p>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quiz Unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
          {errorMsg || "Quiz is not available for this chapter yet."}
        </p>
      </div>
    );
  }

  // Quiz Completion View
  if (isCompleted) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center space-y-6 max-w-2xl mx-auto shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-sky-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25 text-white">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-mono text-rose-500 dark:text-rose-400 uppercase tracking-wider block mb-1 font-bold">
            {ui.quizCompletedTitle}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{chapterTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {ui.quizCompletedSub}
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 max-w-md mx-auto">
          <div className="text-center p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200/50 dark:border-transparent">
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase block">{ui.yourScore}</span>
            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-300">{finalScorePercent}%</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase block">{ui.correctBadge}</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">{correctCount}</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase block">{ui.incorrectBadge}</span>
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-300">{incorrectCount}</span>
          </div>
        </div>

        {/* Feedback message */}
        <p className="text-xs text-slate-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          {finalScorePercent >= 80
            ? ui.masteryHigh
            : finalScorePercent >= 50
            ? ui.masteryMid
            : ui.masteryLow}
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{ui.restartQuiz}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz Question View
  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl relative space-y-6">
      {/* Top Header with Multilingual Language Selector */}
      <div className="border-b border-slate-200/80 dark:border-white/10 pb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase tracking-wider block font-bold">
              CHAPTER QUIZ • {ui.question.toUpperCase()}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{chapterTitle}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Multilingual Selector: English, Telugu, Hindi */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-black/50 border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] font-mono font-semibold px-1.5 text-slate-500 dark:text-gray-400 hidden sm:inline">
                <Languages className="w-3.5 h-3.5 inline mr-1 text-sky-500" />
                {ui.quizLanguageLabel}:
              </span>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  language === "en"
                    ? "bg-gradient-to-r from-rose-500 to-sky-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => handleLanguageChange("te")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  language === "te"
                    ? "bg-gradient-to-r from-rose-500 to-sky-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🇮🇳 తెలుగు
              </button>
              <button
                onClick={() => handleLanguageChange("hi")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  language === "hi"
                    ? "bg-gradient-to-r from-rose-500 to-sky-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🇮🇳 हिन्दी
              </button>
            </div>

            {/* Question Counter */}
            <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-black/40 text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-white/10">
              {ui.question} {currentIndex + 1} {ui.of} {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-sky-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="text-xs font-mono font-bold text-rose-500 dark:text-rose-400 shrink-0 mt-0.5">
            Q{currentIndex + 1}.
          </span>
          <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {translatedQ?.question || currentQ.question}
          </h4>
        </div>
        {currentQ.source_page && (
          <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 block pl-6">
            {ui.sourcePage}: Page {currentQ.source_page}
          </span>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-2.5 pt-1">
        {(translatedQ?.options || currentQ.options).map((option) => {
          const isSelected = currentSelected === option.id;
          const isCorrectAnswer = currentResult && currentResult.correct_answer === option.id;
          const isSelectedWrong = currentResult && isSelected && !currentResult.is_correct;

          let optionStyle =
            "bg-slate-50/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-100/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20";

          if (isCurrentChecked) {
            if (isCorrectAnswer) {
              optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200";
            } else if (isSelectedWrong) {
              optionStyle = "bg-red-500/15 border-red-500 text-red-800 dark:text-red-200";
            } else {
              optionStyle = "opacity-50 border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-500";
            }
          } else if (isSelected) {
            optionStyle =
              "bg-sky-500/15 border-sky-500 text-sky-900 dark:text-white shadow-sm ring-1 ring-sky-500/30";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              disabled={isCurrentChecked}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition ${
                    isCurrentChecked && isCorrectAnswer
                      ? "bg-emerald-500 text-white"
                      : isCurrentChecked && isSelectedWrong
                      ? "bg-red-500 text-white"
                      : isSelected
                      ? "bg-sky-500 text-white"
                      : "bg-slate-200/80 dark:bg-black/40 text-slate-700 dark:text-gray-300 border border-slate-300/60 dark:border-white/10"
                  }`}
                >
                  {option.id}
                </span>
                <span className="text-xs md:text-sm font-medium">{option.text}</span>
              </div>

              {/* Status Icons */}
              {isCurrentChecked && isCorrectAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {isCurrentChecked && isSelectedWrong && (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Check Answer Button (Visible before checking) */}
      {!isCurrentChecked && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleCheckAnswer}
            disabled={!currentSelected || isChecking}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              currentSelected && !isChecking
                ? "bg-gradient-to-r from-rose-600 to-sky-600 text-white shadow-md hover:scale-[1.02]"
                : "bg-slate-200/80 dark:bg-white/10 text-slate-400 dark:text-gray-500 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
            }`}
          >
            {isChecking ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{ui.checking}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{ui.checkAnswer}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Answer Result & Explanation Panel (Visible after checking) */}
      {currentResult && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 transition-all duration-300 ${
            currentResult.is_correct
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
              : "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {currentResult.is_correct ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-300">{ui.correctFeedback}</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{ui.incorrectFeedback}</span>
                <span className="text-xs font-normal text-slate-600 dark:text-gray-300 ml-2">
                  ({ui.correctBadge}: {currentResult.correct_answer})
                </span>
              </>
            )}
          </div>

          {currentResult.explanation && (
            <div className="pt-1 text-slate-700 dark:text-gray-300 leading-relaxed font-sans pl-7">
              <span className="font-semibold text-slate-900 dark:text-white mr-1">
                {ui.explanationLabel}:
              </span>
              {currentResult.explanation}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-white/10">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            currentIndex > 0
              ? "bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 border border-slate-200/80 dark:border-white/10"
              : "opacity-40 cursor-not-allowed text-slate-400 dark:text-gray-500"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{ui.previousQuestion}</span>
        </button>

        {/* Answered progress dots */}
        <div className="hidden sm:flex items-center gap-1 max-w-[200px] overflow-x-auto py-1">
          {questions.map((_, idx) => {
            const hasResult = results[idx];
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-4 bg-sky-500"
                    : hasResult
                    ? hasResult.is_correct
                      ? "bg-emerald-500"
                      : "bg-red-500"
                    : "bg-slate-300 dark:bg-white/20"
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>{currentIndex === questions.length - 1 ? "Finish Quiz" : ui.nextQuestion}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
