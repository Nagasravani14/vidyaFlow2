"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MindMapViewer from "@/components/MindMapViewer";
import AICoachChatbot from "@/components/AICoachChatbot";

function ConceptMapContent() {
  const searchParams = useSearchParams();
  const lessonIdParam = searchParams.get("lesson_id") || searchParams.get("chapter_id");
  const lessonId = lessonIdParam ? parseInt(lessonIdParam) : 2;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex">
      <Sidebar currentRole="student" />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        <MindMapViewer lessonId={lessonId} />
        <AICoachChatbot initialOpen={false} />
      </main>
    </div>
  );
}

export default function ConceptMapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading interactive mind map...</div>}>
      <ConceptMapContent />
    </Suspense>
  );
}
