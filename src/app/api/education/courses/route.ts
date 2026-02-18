import { NextResponse } from "next/server";
import {
  getCourseCatalog,
  getAdminCourseCatalog,
  upsertCourse,
} from "@/server/modules/education/service";
import { requireUser } from "@/server/security/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? undefined;
  const scope = searchParams.get("scope") ?? "public";

  try {
    const courses =
      scope === "admin"
        ? (await requireUser({ role: "ADMIN" }), await getAdminCourseCatalog())
        : await getCourseCatalog(slug ?? undefined);
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
    await requireUser({ role: "ADMIN" });
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

