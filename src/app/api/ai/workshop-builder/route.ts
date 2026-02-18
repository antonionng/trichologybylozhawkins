import { NextResponse } from "next/server";
import { z } from "zod";
import { queueContentGeneration } from "@/server/modules/ai/service";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

const workshopBuilderRequestSchema = z.object({
  workshopId: z.string().cuid(),
  prompt: z.string().optional(),
  image: z
    .object({
      aspectRatio: z.string().optional(),
      style: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = workshopBuilderRequestSchema.parse(await request.json());

    const prompt =
      (body.prompt ?? "").trim() ||
      "Generate a premium in-person workshop sales page with persuasive content, detailed agenda, learning outcomes, FAQs, and testimonials based on the existing workshop title and details.";

    const generation = await queueContentGeneration({
      mode: "workshop-builder",
      workshopId: body.workshopId,
      prompt,
      media: body.image
        ? { kind: "image", ...body.image }
        : { kind: "none" },
      requestedBy: "dashboard-workshop-builder",
    });

    return NextResponse.json({
      ok: true,
      generationId: generation.id,
      status: generation.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to queue workshop builder",
      },
      { status: 400 }
    );
  }
}
