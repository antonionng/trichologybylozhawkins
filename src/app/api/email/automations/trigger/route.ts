import { NextResponse } from "next/server";
import { triggerAutomation } from "@/server/modules/email/service";
import { apiErrorResponse } from "@/server/http/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const run = await triggerAutomation(body.automationId, body.contactId);
    return NextResponse.json(run);
  } catch (error) {
    return apiErrorResponse(error, "Failed to trigger automation");
  }
}

