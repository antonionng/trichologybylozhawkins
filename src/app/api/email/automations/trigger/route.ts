import { NextResponse } from "next/server";
import { triggerAutomation } from "@/server/modules/email/service";
import { apiErrorResponse } from "@/server/http/errors";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const run = await triggerAutomation(body.automationId, body.contactId);
    return NextResponse.json(run);
  } catch (error) {
    return apiErrorResponse(error, "Failed to trigger automation");
  }
}

