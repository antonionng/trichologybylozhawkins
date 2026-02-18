import { NextResponse } from "next/server";
import { ContentSlotStatus } from "@prisma/client";
import { contentSlotStatusSchema } from "@/server/schema";
import { updateContentSlotStatus } from "@/server/modules/contentFactory/service";
import { requireUser } from "@/server/security/auth";
import { aiQueue } from "@/server/jobs/queues";

export async function PATCH(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = contentSlotStatusSchema.parse(body);

    const slot = await updateContentSlotStatus(data.slotId, data.status);

    if (data.status === ContentSlotStatus.APPROVED) {
      await aiQueue.add(
        "generate-post-image",
        { slotId: data.slotId },
        { removeOnComplete: true, attempts: 3 }
      );
    }

    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update slot status",
      },
      { status: 400 }
    );
  }
}







