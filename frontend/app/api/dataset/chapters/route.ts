import { NextResponse } from "next/server";
import { getAllChapters } from "@/lib/datasetLoader";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chapters = getAllChapters();
    return NextResponse.json({
      success: true,
      count: chapters.length,
      chapters,
    });
  } catch (error: any) {
    console.error("Error in /api/dataset/chapters:", error);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        chapters: [],
        error: error?.message || "Failed to load chapters",
      },
      { status: 500 }
    );
  }
}
