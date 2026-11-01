"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import AICoachChatbot from "@/components/AICoachChatbot";
import { BotMessageSquare, Sparkles, MessageCircle, HelpCircle } from "lucide-react";

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto">
        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            VidyaFlow Socratic AI Coach
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Personalized tutor guiding you step-by-step through algebraic equations with progressive hints in English, Telugu, and Hindi.
          </p>
        </div>

        <div className="p-8 rounded-2xl glass-card border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-neon-cyan">
            <BotMessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Your Dedicated Math Tutor is Ready</h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
            The AI Coach will never give away direct answers on assessments. Instead, it breaks problems into manageable thinking steps. Click below to open your tutor drawer!
          </p>
        </div>

        <AICoachChatbot initialOpen={true} />
      </main>
    </div>
  );
}
