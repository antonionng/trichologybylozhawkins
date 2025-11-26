import { NextResponse } from "next/server";
import { triggerAutomation } from "@/server/modules/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const run = await triggerAutomation(body.automationId, body.contactId);
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to trigger automation",
      },
      { status: 400 }
    );
  }
}

