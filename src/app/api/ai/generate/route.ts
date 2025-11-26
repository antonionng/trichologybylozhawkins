import { NextResponse } from "next/server";
import { queueContentGeneration } from "@/server/modules/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const generation = await queueContentGeneration(body);
    return NextResponse.json(generation);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to queue generation",
      },
      { status: 400 }
    );
  }
}

