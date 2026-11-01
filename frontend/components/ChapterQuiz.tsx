"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  BookOpen,
  AlertCircle,
  Check,
  Flame,
} from "lucide-react";

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
  const currentSelected = selectedAnswers[currentIndex] || null;
  const currentResult = results[currentIndex] || null;
  const isCurrentChecked = Boolean(currentResult);

  const handleSelectOption = (optionId: string) => {
    if (isCurrentChecked) return; // Prevent changing after checking
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
        setResults((prev) => ({
          ...prev,
          [currentIndex]: {
            is_correct: data.is_correct,
            correct_answer: data.correct_answer,
            explanation: data.explanation,
          },
        }));
      } else {
        // Fallback if check API failed
        setResults((prev) => ({
          ...prev,
          [currentIndex]: {
            is_correct: false,
            correct_answer: "",
            explanation: "Answer recorded.",
          },
        }));
      }
    } catch (err) {
      console.error("Check answer error:", err);
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
      <div className="glass-card p-10 rounded-2xl border border-white/10 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 font-mono">Loading chapter quiz from dataset...</p>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Quiz Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          {errorMsg || "Quiz is not available for this chapter yet."}
        </p>
      </div>
    );
  }

  // Quiz Completion View
  if (isCompleted) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-neon-cyan text-white">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
            QUIZ COMPLETED
          </span>
          <h2 className="text-2xl font-extrabold text-white">{chapterTitle}</h2>
          <p className="text-xs text-gray-400 mt-1">
            Questions loaded from Telangana SCERT textbook curriculum
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Score</span>
            <span className="text-2xl font-extrabold text-cyan-300">{finalScorePercent}%</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">Correct</span>
            <span className="text-2xl font-extrabold text-emerald-300">{correctCount}</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] font-mono text-red-400 uppercase block">Incorrect</span>
            <span className="text-2xl font-extrabold text-red-300">{incorrectCount}</span>
          </div>
        </div>

        {/* Feedback message */}
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          {finalScorePercent >= 80
            ? "Outstanding mastery! You have demonstrated a strong conceptual grasp of this chapter's topics."
            : finalScorePercent >= 50
            ? "Good effort! Review the explanations and mind map concepts to reinforce tricky areas."
            : "Keep practicing! Review the chapter mind map to strengthen foundational concepts."}
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-neon-cyan"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz Question View
  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative space-y-6">
      {/* Top Header & Progress */}
      <div className="border-b border-white/10 pb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              CHAPTER QUIZ
            </span>
            <h3 className="text-lg font-bold text-white">{chapterTitle}</h3>
          </div>

          {/* Difficulty & Stats Badge */}
          <div className="flex items-center gap-2">
            {currentQ.difficulty && (
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  currentQ.difficulty === "easy"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : currentQ.difficulty === "hard"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                }`}
              >
                {currentQ.difficulty}
              </span>
            )}
            <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-black/40 text-gray-300 border border-white/10">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="text-xs font-mono font-bold text-cyan-400 shrink-0 mt-0.5">
            Q{currentIndex + 1}.
          </span>
          <h4 className="text-base md:text-lg font-medium text-white leading-relaxed">
            {currentQ.question}
          </h4>
        </div>
        {currentQ.source_page && (
          <span className="text-[10px] font-mono text-gray-400 block pl-6">
            Textbook Reference: Page {currentQ.source_page}
          </span>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-2.5 pt-1">
        {currentQ.options.map((option) => {
          const isSelected = currentSelected === option.id;
          const isCorrectAnswer = currentResult && currentResult.correct_answer === option.id;
          const isSelectedWrong = currentResult && isSelected && !currentResult.is_correct;

          let optionStyle =
            "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20";

          if (isCurrentChecked) {
            if (isCorrectAnswer) {
              optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-neon-green";
            } else if (isSelectedWrong) {
              optionStyle = "bg-red-500/20 border-red-500 text-red-200";
            } else {
              optionStyle = "bg-white/[0.02] border-white/5 text-gray-500 opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "bg-cyan-500/20 border-cyan-400 text-white shadow-neon-cyan";
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
                      ? "bg-cyan-400 text-black"
                      : "bg-black/40 text-gray-300 border border-white/10"
                  }`}
                >
                  {option.id}
                </span>
                <span className="text-xs md:text-sm">{option.text}</span>
              </div>

              {/* Status Icons */}
              {isCurrentChecked && isCorrectAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {isCurrentChecked && isSelectedWrong && (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
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
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-neon-cyan hover:scale-[1.02]"
                : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {isChecking ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Check Answer</span>
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
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {currentResult.is_correct ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300">Correct Answer!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Incorrect Answer</span>
                <span className="text-xs font-normal text-gray-300 ml-2">
                  (Correct Answer: Option {currentResult.correct_answer})
                </span>
              </>
            )}
          </div>

          {currentResult.explanation && (
            <div className="pt-1 text-gray-300 leading-relaxed font-sans pl-7">
              <span className="font-semibold text-white mr-1">Explanation:</span>
              {currentResult.explanation}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            currentIndex > 0
              ? "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
              : "opacity-40 cursor-not-allowed text-gray-500"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
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
                    ? "w-4 bg-cyan-400"
                    : hasResult
                    ? hasResult.is_correct
                      ? "bg-emerald-400"
                      : "bg-red-400"
                    : "bg-white/20"
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-neon-cyan"
        >
          <span>{currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
