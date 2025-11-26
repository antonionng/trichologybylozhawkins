import { NextResponse } from "next/server";
import { handleEmailWebhook } from "@/server/modules/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleEmailWebhook(body);
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 400 }
    );
  }
}

