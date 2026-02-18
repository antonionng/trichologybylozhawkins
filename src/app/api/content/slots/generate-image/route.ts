import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/security/auth";
import { requestPostImageGeneration } from "@/server/modules/ai/postImageGeneration";

const requestSchema = z.object({
  slotId: z.string().cuid(),
});

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = requestSchema.parse(body);

    const result = await requestPostImageGeneration(data.slotId);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 400 }
    );
  }
}

