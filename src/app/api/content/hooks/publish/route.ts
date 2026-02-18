import { NextResponse } from "next/server";
import { contentPublishHookSchema } from "@/server/schema";
import { markSlotPublished } from "@/server/modules/contentFactory/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contentPublishHookSchema.parse(body);

    const slot = await markSlotPublished(data.slotId, data.publishedAt ?? new Date());

    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to record publish event",
      },
      { status: 400 }
    );
  }
}







