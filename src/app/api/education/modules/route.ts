import { NextResponse } from "next/server";
import { upsertCourseModule } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courseModule = await upsertCourseModule(body);
    return NextResponse.json(courseModule);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save module",
      },
      { status: 400 }
    );
  }
}

