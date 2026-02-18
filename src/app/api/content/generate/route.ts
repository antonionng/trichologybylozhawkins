import { NextResponse } from "next/server";
import { ContentChannel, ContentSlotStatus } from "@prisma/client";
import { contentGenerationRequestSchema } from "@/server/schema";
import {
  upsertContentSlot,
} from "@/server/modules/contentFactory/service";
import { queueContentGeneration } from "@/server/modules/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contentGenerationRequestSchema.parse(body);

    const primaryChannel = data.channels[0] ?? ContentChannel.GENERIC;

    const slotPayload: Parameters<typeof upsertContentSlot>[0] = {
      id: data.slotId,
      planId: data.planId,
      title: data.title,
      brief: data.prompt,
      persona: data.persona,
      campaign: data.campaign,
      channel: primaryChannel,
      scheduledFor: data.scheduledFor,
      metadata: {
        channels: data.channels,
        tone: data.tone,
        goals: data.goals,
      },
    };

    if (!data.slotId) {
      slotPayload.status = ContentSlotStatus.DRAFT;
    }

    const slot = await upsertContentSlot(slotPayload);

    const generation = await queueContentGeneration({
      prompt: data.prompt,
      input: { prompt: data.prompt },
      mode: "content-factory",
      slotId: slot.id,
      persona: data.persona,
      campaign: data.campaign,
      channels: data.channels,
      tone: data.tone,
      goals: data.goals,
      variants: data.variants,
      media: data.includeImages ? { kind: "image" } : { kind: "none" },
    });

    return NextResponse.json({
      slot,
      generation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to queue content generation",
      },
      { status: 400 }
    );
  }
}

