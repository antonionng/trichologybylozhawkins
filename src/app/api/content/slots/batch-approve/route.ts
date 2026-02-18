import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { ContentSlotStatus } from "@prisma/client";
import { requireUser } from "@/server/security/auth";
import { requestPostImageGeneration } from "@/server/modules/ai/postImageGeneration";

const batchApproveSchema = z.object({
  planId: z.string().cuid(),
});

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = batchApproveSchema.parse(body);

    const slotsToApprove = await prisma.contentSlot.findMany({
      where: {
        planId: data.planId,
        status: ContentSlotStatus.NEEDS_REVIEW,
      },
      select: { id: true },
    });

    const slotIds = slotsToApprove.map((s) => s.id);

    const result = await prisma.contentSlot.updateMany({
      where: {
        id: { in: slotIds },
      },
      data: {
        status: ContentSlotStatus.APPROVED,
      },
    });

    // Trigger image generation for each approved slot
    const imageResults = await Promise.all(slotIds.map((slotId) => requestPostImageGeneration(slotId)));
    const queued = imageResults.filter((r) => r.mode === "queued").length;
    const inline = imageResults.filter((r) => r.mode === "inline").length;

    return NextResponse.json({ updated: result.count, imageGeneration: { queued, inline } });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to batch approve",
      },
      { status: 400 }
    );
  }
}



