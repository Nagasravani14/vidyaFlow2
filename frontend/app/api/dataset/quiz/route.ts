import { NextRequest, NextResponse } from "next/server";
import { findChapter, loadChapterQuiz } from "@/lib/datasetLoader";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapter_id = searchParams.get("chapter_id") || undefined;
    const lesson_id = searchParams.get("lesson_id") || undefined;
    const gradeClass = searchParams.get("class") || undefined;
    const subject = searchParams.get("subject") || undefined;
    const chapter_number = searchParams.get("chapter_number") || undefined;
    const title = searchParams.get("title") || undefined;

    const chapter = findChapter({
      chapter_id,
      lesson_id,
      class: gradeClass,
      subject,
      chapter_number,
      title,
    });

    if (!chapter) {
      return NextResponse.json(
        {
          available: false,
          message: "Quiz is not available for this chapter yet.",
          questions: [],
        },
        { status: 200 }
      );
    }

    const quizData = loadChapterQuiz(chapter, false);
    if (!quizData || quizData.questions.length === 0) {
      return NextResponse.json(
        {
          available: false,
          chapter_id: chapter.chapter_id,
          chapter_title: chapter.chapter_title,
          message: "Quiz is not available for this chapter yet.",
          questions: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      available: true,
      chapter_id: chapter.chapter_id,
      chapter_title: chapter.chapter_title,
      class: chapter.class,
      subject: chapter.subject,
      chapter_number: chapter.chapter_number,
      total_questions: quizData.questions.length,
      questions: quizData.questions,
    });
  } catch (error: any) {
    console.error("Error in /api/dataset/quiz:", error);
    return NextResponse.json(
      {
        available: false,
        message: "Error loading chapter quiz.",
        questions: [],
      },
      { status: 500 }
    );
  }
}
