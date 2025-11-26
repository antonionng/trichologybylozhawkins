import { NextResponse } from "next/server";
import { upsertEmailCampaign } from "@/server/modules/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const campaign = await upsertEmailCampaign(body);
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save campaign",
      },
      { status: 400 }
    );
  }
}

