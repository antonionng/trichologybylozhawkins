import { NextResponse } from "next/server";
import { upsertCoursePrice } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const price = await upsertCoursePrice(body);
    return NextResponse.json(price);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save price",
      },
      { status: 400 }
    );
  }
}

