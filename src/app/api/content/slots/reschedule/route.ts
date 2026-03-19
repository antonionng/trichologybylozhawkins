import { NextResponse } from "next/server";
import { contentSlotRescheduleSchema } from "@/server/schema";
import { rescheduleContentSlot } from "@/server/modules/contentFactory/service";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = contentSlotRescheduleSchema.parse(body);

    const slot = await rescheduleContentSlot(data.slotId, data.scheduledFor);

    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to reschedule slot",
      },
      { status: 400 }
    );
  }
}







