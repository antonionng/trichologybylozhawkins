import { NextResponse } from "next/server";
import { scheduleCampaignSend } from "@/server/modules/email/service";
import { apiErrorResponse } from "@/server/http/errors";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const campaign = await scheduleCampaignSend(body.campaignId);
    return NextResponse.json(campaign);
  } catch (error) {
    return apiErrorResponse(error, "Failed to schedule campaign");
  }
}

