import { NextResponse } from "next/server";
import { createCourseEnquiry } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enquiry = await createCourseEnquiry(body);
    return NextResponse.json(enquiry);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create enquiry",
      },
      { status: 400 }
    );
  }
}

