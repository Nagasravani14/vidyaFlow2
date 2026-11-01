import { NextRequest, NextResponse } from "next/server";
import { findChapter, loadChapterMindMap } from "@/lib/datasetLoader";

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
          message: "Mind map is not available for this chapter yet.",
          root: null,
        },
        { status: 200 }
      );
    }

    const mindmapData = loadChapterMindMap(chapter);
    if (!mindmapData || !mindmapData.root) {
      return NextResponse.json(
        {
          available: false,
          chapter_id: chapter.chapter_id,
          chapter_title: chapter.chapter_title,
          message: "Mind map is not available for this chapter yet.",
          root: null,
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
      title: mindmapData.title,
      root: mindmapData.root,
    });
  } catch (error: any) {
    console.error("Error in /api/dataset/mindmap:", error);
    return NextResponse.json(
      {
        available: false,
        message: "Error loading chapter mind map.",
        root: null,
      },
      { status: 500 }
    );
  }
}
