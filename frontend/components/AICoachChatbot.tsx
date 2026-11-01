"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  X,
  Send,
  Sparkles,
  HelpCircle,
  Languages,
  ChevronDown,
  Minimize2,
  Maximize2,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Compass,
  Zap,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "coach";
  content: string;
  language: string;
  type?: string;
  source_references?: string[];
  chapter_title?: string;
}

interface AICoachChatbotProps {
  initialOpen?: boolean;
  conceptContext?: string;
  chapterId?: number;
  chapterTitle?: string;
  subject?: string;
  gradeLevel?: number;
  board?: string;
  isEmbedded?: boolean;
}

export default function AICoachChatbot({
  initialOpen = false,
  conceptContext = "MATH8_LIN_EQN_VARS_BOTH",
  chapterId = 1,
  chapterTitle = "Linear Equations in One Variable",
  subject = "Mathematics",
  gradeLevel = 8,
  board = "Telangana State Board",
  isEmbedded = false,
}: AICoachChatbotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen || isEmbedded);
  const [language, setLanguage] = useState<"en" | "te" | "hi">("en");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "coach",
      content:
        "Namaste Hero Ananya! I am your Spider AI Coach 🦸‍♂️. I am here to guide you step-by-step through Class 8 Mathematics and Science across the Multiverse. I'll give you Socratic clues and textbook hints rather than direct answers, so you master every concept! What mission shall we tackle today?",
      language: "en",
      chapter_title: chapterTitle,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: "Why do signs change in transposition?", q: "Why does addition become subtraction when moving terms across '='?" },
    { label: "Variables on Both Sides hint", q: "How do I solve equations with variables on both sides like 5x - 8 = 2x + 7?" },
    { label: "Integer double-negative rule", q: "Explain why -14 - (-9) becomes -14 + 9?" },
    { label: "Give me an easy practice clue", q: "Can you give me a simple step-by-step thinking clue for Class 8 linear equations?" },
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputMessage).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: textToSend,
      language: language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const data = await fetchFromAPI("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({
          user_id: 1,
          message: textToSend,
          language: language,
          concept_code: conceptContext,
          chapter_id: chapterId,
          board: board,
          grade_level: gradeLevel,
          subject: subject,
        }),
      });

      const coachMsg: Message = {
        id: `c-${Date.now()}`,
        sender: "coach",
        content: data.reply,
        language: data.language || language,
        type: data.type,
        source_references: data.source_references,
        chapter_title: data.chapter_title || chapterTitle,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `c-error-${Date.now()}`,
          sender: "coach",
          content:
            "Spider Sense Notice: Connection to AI tutor backend was interrupted. Running in local Socratic fallback mode. Let's think through your problem: What operation are you applying to both sides?",
          language: language,
          type: "error",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const containerClasses = isEmbedded
    ? "w-full h-[620px] flex flex-col rounded-3xl spider-card border border-spider-cyan-500/40 shadow-2xl overflow-hidden bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl transition-all"
    : "fixed bottom-6 right-6 w-[440px] max-w-[92vw] h-[590px] max-h-[85vh] z-50 flex flex-col rounded-3xl spider-card border border-spider-cyan-500/40 shadow-2xl overflow-hidden bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl transition-all";

  return (
    <>
      {/* Floating Spider-Signal Button when closed */}
      {!isEmbedded && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-spider-red-600 via-purple-700 to-spider-blue-600 text-white font-extrabold text-xs shadow-neon-red hover:scale-105 transition-all duration-300 border border-spider-cyan-400/40 cursor-pointer group"
          aria-label="Open Spider AI Coach"
        >
          <div className="relative flex h-6 w-6 items-center justify-center">
            <span className="text-lg group-hover:scale-125 transition-transform" role="img" aria-label="Spider">
              🦸‍♂️
            </span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-spider-cyan-400 animate-ping" />
          </div>
          <span>Consult Spider Coach</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Chat Container */}
      {(isOpen || isEmbedded) && (
        <div className={containerClasses}>
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-spider-red-600 to-spider-blue-600 flex items-center justify-center shadow-md text-lg">
                <span>🦸‍♂️</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-spider-cyan-400 border border-black" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Spider AI Socratic Coach</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-spider-cyan-500/20 text-spider-cyan-600 dark:text-spider-cyan-400 border border-spider-cyan-500/30">
                    GEMINI
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {chapterTitle ? `Chapter: ${chapterTitle}` : "Socratic Hints ? Multiverse Grounded"}
                </p>
              </div>
            </div>

            {/* Language Toggle & Close */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-200/80 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg p-0.5 text-[10px]">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-1.5 py-0.5 rounded font-mono font-bold transition ${
                    language === "en"
                      ? "bg-spider-blue-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="English"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("te")}
                  className={`px-1.5 py-0.5 rounded font-bold transition ${
                    language === "te"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="తెలుగు"
                >
                  తె
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-1.5 py-0.5 rounded font-bold transition ${
                    language === "hi"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="हिन्दी"
                >
                  हि
                </button>
              </div>

              {!isEmbedded && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-spider-red-600 to-spider-blue-600 text-white rounded-br-xs border border-white/20 shadow-sm"
                      : "bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-gray-200 rounded-bl-xs"
                  }`}
                >
                  {m.sender === "coach" && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-spider-blue-600 dark:text-spider-cyan-400 mb-1.5 pb-1 border-b border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-1 font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>SPIDER COACH GUIDANCE</span>
                      </div>
                      {m.chapter_title && (
                        <span className="text-slate-400 truncate max-w-[150px]">
                          {m.chapter_title}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line text-xs">{m.content}</p>

                  {/* Textbook Source Citations */}
                  {m.source_references && m.source_references.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1 text-spider-blue-500 dark:text-spider-cyan-300 font-mono font-bold">
                        <BookOpen className="w-3 h-3" />
                        <span>Textbook Grounding:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.source_references.map((ref, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-[10px] text-slate-700 dark:text-gray-300 font-mono"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-slate-500 dark:text-gray-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-spider-cyan-400 animate-ping" />
                  <span>Synthesizing Socratic hint with Spider AI...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.q)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition hover:border-spider-cyan-500/40 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === "te"
                  ? "మీ సందేహాన్ని అడగండి..."
                  : language === "hi"
                  ? "अपना प्रश्न पूछें..."
                  : "Ask a question or request a clue..."
              }
              className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-spider-cyan-400 focus:ring-1 focus:ring-spider-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 rounded-xl bg-gradient-to-r from-spider-red-500 to-spider-blue-600 hover:from-spider-red-400 hover:to-spider-blue-500 text-white disabled:opacity-40 transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
