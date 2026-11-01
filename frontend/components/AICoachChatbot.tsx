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
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "coach";
  content: string;
  language: string;
  type?: string;
}

interface AICoachChatbotProps {
  initialOpen?: boolean;
  conceptContext?: string;
}

export default function AICoachChatbot({
  initialOpen = false,
  conceptContext = "MATH8_LIN_EQN_VARS_BOTH",
}: AICoachChatbotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [language, setLanguage] = useState<"en" | "te" | "hi">("en");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "coach",
      content:
        "Namaste Ananya! I am your VidyaFlow Socratic AI Coach 🤖. I am here to guide you step-by-step through Class 8 Mathematics. I will give you thinking clues rather than direct answers so you master every concept! How can I help you today?",
      language: "en",
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
        }),
      });

      const coachMsg: Message = {
        id: `c-${Date.now()}`,
        sender: "coach",
        content: data.reply,
        language: data.language || language,
        type: data.type,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      // Local fallback response
      let fallbackReply = "";
      if (language === "te") {
        fallbackReply =
          "సమీకరణాలను సాధించేటప్పుడు 'సమతుల్యత' (Balance) అతి ముఖ్యమైనది! ఇరువైపులా ఒకే రకమైన మార్పు చేయండి. మీరు ఏ లెక్క సాధిస్తున్నారో టైప్ చేయండి!";
      } else if (language === "hi") {
        fallbackReply =
          "समीकरणों को हल करते समय संतुलन बनाए रखना सबसे महत्वपूर्ण है! दोनों पक्षों में समान संक्रिया करें। अपनी समस्या यहाँ लिखें!";
      } else {
        fallbackReply =
          "Remember the golden balancing principle: Whatever operation you apply to the LHS, you must apply to the RHS. Tell me what step you want to try first!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `c-fallback-${Date.now()}`,
          sender: "coach",
          content: fallbackReply,
          language: language,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Pill when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-neon-purple hover:scale-105 transition-all duration-300 border border-cyan-400/30"
        >
          <BotMessageSquare className="w-5 h-5 text-cyan-300 animate-bounce" />
          <span>Ask AI Coach</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}

      {/* Floating or Docked Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] max-w-[92vw] h-[580px] max-h-[85vh] z-50 flex flex-col rounded-2xl glass-card border border-cyan-500/30 shadow-2xl overflow-hidden bg-[#0B0F19]/95 backdrop-blur-xl">
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
                    AI Assist
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400">Progressive hints • No direct answers</p>
              </div>
            </div>

            {/* Language Toggle & Close */}
            <div className="flex items-center gap-1">
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    language === "en" ? "bg-cyan-500/40 text-cyan-200" : "text-gray-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("te")}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    language === "te" ? "bg-purple-500/40 text-purple-200" : "text-gray-400 hover:text-white"
                  }`}
                >
                  తె
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    language === "hi" ? "bg-emerald-500/40 text-emerald-200" : "text-gray-400 hover:text-white"
                  }`}
                >
                  हि
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-purple-600/90 to-cyan-600/90 text-white rounded-br-xs border border-white/10 shadow-neon-cyan"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-xs"
                  }`}
                >
                  {m.sender === "coach" && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>COACH GUIDANCE</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-gray-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Formulating Socratic guidance...</span>
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
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition hover:border-cyan-500/40"
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
                  ? "మీ సందేహాన్ని ఇక్కడ అడగండి..."
                  : language === "hi"
                  ? "अपना सवाल यहाँ पूछें..."
                  : "Ask a math question or step..."
              }
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white disabled:opacity-50 transition shadow-neon-cyan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
