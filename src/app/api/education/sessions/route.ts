import { NextResponse } from "next/server";
import { upsertCourseSession } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await upsertCourseSession(body);
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save session",
      },
      { status: 400 }
    );
  }
}

