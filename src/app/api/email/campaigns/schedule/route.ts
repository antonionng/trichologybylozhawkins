import { NextResponse } from "next/server";
import { scheduleCampaignSend } from "@/server/modules/email/service";
import { apiErrorResponse } from "@/server/http/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const campaign = await scheduleCampaignSend(body.campaignId);
    return NextResponse.json(campaign);
  } catch (error) {
    return apiErrorResponse(error, "Failed to schedule campaign");
  }
}

