import { NextResponse } from "next/server";
import { scheduleCampaignSend } from "@/server/modules/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const campaign = await scheduleCampaignSend(body.campaignId);
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to schedule campaign",
      },
      { status: 400 }
    );
  }
}

