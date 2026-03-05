import { NextResponse } from "next/server";
import { queueContentGeneration } from "@/server/modules/ai/service";
import { apiErrorResponse } from "@/server/http/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const generation = await queueContentGeneration(body);
    return NextResponse.json(generation);
  } catch (error) {
    return apiErrorResponse(error, "Failed to queue generation");
  }
}

