import { NextResponse } from "next/server";
import {
  getCourseCatalog,
  upsertCourse,
} from "@/server/modules/education/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? undefined;

  try {
    const courses = await getCourseCatalog(slug ?? undefined);
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch courses",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const course = await upsertCourse(body);
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save course" },
      { status: 400 }
    );
  }
}

