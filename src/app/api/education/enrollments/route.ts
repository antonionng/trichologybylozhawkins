import { NextResponse } from "next/server";
import { recordEnrollmentStatus } from "@/server/modules/education/service";
import { requireUser } from "@/server/security/auth";

export async function PATCH(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const enrollment = await recordEnrollmentStatus(body);
    return NextResponse.json(enrollment);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update enrollment",
      },
      { status: 400 }
    );
  }
}

