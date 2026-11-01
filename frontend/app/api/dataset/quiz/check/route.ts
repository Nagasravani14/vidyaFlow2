import { NextRequest, NextResponse } from "next/server";
import { findChapter, checkQuestionAnswer } from "@/lib/datasetLoader";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapter_id, question_id, selected_option, lesson_id } = body;

    if (!question_id || !selected_option) {
      return NextResponse.json(
        { error: "Missing required fields: question_id and selected_option" },
        { status: 400 }
      );
    }

    const chapter = findChapter({ chapter_id, lesson_id });
    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found in dataset" },
        { status: 404 }
      );
    }

    const result = checkQuestionAnswer(chapter, question_id, selected_option);
    if (!result) {
      return NextResponse.json(
        { error: "Question not found in chapter quiz" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      question_id,
      selected_option,
      is_correct: result.is_correct,
      correct_answer: result.correct_answer,
      explanation: result.explanation,
    });
  } catch (error: any) {
    console.error("Error in /api/dataset/quiz/check:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
