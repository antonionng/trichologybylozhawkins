import { NextResponse } from "next/server";
import { upsertCourseLesson } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lesson = await upsertCourseLesson(body);
    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save lesson",
      },
      { status: 400 }
    );
  }
}

