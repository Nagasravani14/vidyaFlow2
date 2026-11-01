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
        "Namaste Ananya! I am your VidyaFlow Socratic AI Coach 🤖. I am here to guide you step-by-step through Class 8 Mathematics. I will give you thinking clues rather than direct answers so you master every concept! How can I help you today?",
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
    { label: "Why do signs change in transposition?", q: "Why does addition become subtraction when moving across '='?" },
    { label: "Help with Variables on Both Sides", q: "How do I solve equations with variables on both sides like 5x - 8 = 2x + 7?" },
    { label: "Integer double-negative rule", q: "Explain why -14 - (-9) becomes -14 + 9?" },
    { label: "Give me an easy practice example", q: "Can you give me a simple step-by-step example for Class 8 linear equations?" },
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
            "I encountered a temporary connection issue reaching the AI tutor service. Please verify your connection or try asking again in a moment.",
          language: language,
          type: "error",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const containerClasses = isEmbedded
    ? "w-full h-[620px] flex flex-col rounded-2xl glass-card border border-cyan-500/30 shadow-2xl overflow-hidden bg-[#0B0F19]/95 backdrop-blur-xl"
    : "fixed bottom-6 right-6 w-[420px] max-w-[92vw] h-[580px] max-h-[85vh] z-50 flex flex-col rounded-2xl glass-card border border-cyan-500/30 shadow-2xl overflow-hidden bg-[#0B0F19]/95 backdrop-blur-xl";

  return (
    <>
      {/* Floating Toggle Pill when closed (only if not embedded) */}
      {!isEmbedded && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-neon-purple hover:scale-105 transition-all duration-300 border border-cyan-400/30 cursor-pointer"
        >
          <BotMessageSquare className="w-5 h-5 text-cyan-300 animate-bounce" />
          <span>Ask AI Coach</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}

      {/* Chat Container */}
      {(isOpen || isEmbedded) && (
        <div className={containerClasses}>
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-neon-cyan">
                <BotMessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>VidyaFlow Socratic Coach</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-normal">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400">
                  {chapterTitle ? `Chapter: ${chapterTitle}` : "Progressive hints • No direct answers"}
                </p>
              </div>
            </div>

            {/* Language Toggle & Close */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    language === "en" ? "bg-cyan-500/40 text-cyan-200" : "text-gray-400 hover:text-white"
                  }`}
                  title="English"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("te")}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    language === "te" ? "bg-purple-500/40 text-purple-200" : "text-gray-400 hover:text-white"
                  }`}
                  title="తెలుగు"
                >
                  తె
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    language === "hi" ? "bg-emerald-500/40 text-emerald-200" : "text-gray-400 hover:text-white"
                  }`}
                  title="हिन्दी"
                >
                  हि
                </button>
              </div>

              {!isEmbedded && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
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
                      ? "bg-gradient-to-r from-purple-600/90 to-cyan-600/90 text-white rounded-br-xs border border-white/10 shadow-neon-cyan"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-xs"
                  }`}
                >
                  {m.sender === "coach" && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1.5 pb-1 border-b border-white/5">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI COACH GUIDANCE</span>
                      </div>
                      {m.chapter_title && (
                        <span className="text-gray-400 truncate max-w-[150px]">
                          {m.chapter_title}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line text-xs">{m.content}</p>

                  {/* Textbook Source Citations */}
                  {m.source_references && m.source_references.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-gray-400 space-y-0.5">
                      <div className="flex items-center gap-1 text-cyan-300 font-mono">
                        <BookOpen className="w-3 h-3" />
                        <span>Textbook Grounding:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.source_references.map((ref, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-gray-300"
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
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-gray-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Formulating Socratic guidance with Gemini...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.q)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition hover:border-cyan-500/40 cursor-pointer"
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
            className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === "te"
                  ? "మీ సందేహాన్ని లేదా లెక్కను ఇక్కడ అడగండి..."
                  : language === "hi"
                  ? "अपना सवाल या समीकरण यहाँ लिखें..."
                  : "Ask a question about this chapter..."
              }
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white disabled:opacity-50 transition shadow-neon-cyan cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
