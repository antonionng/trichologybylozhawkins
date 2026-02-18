import { NextResponse } from "next/server";
import { z } from "zod";
import { queueContentGeneration } from "@/server/modules/ai/service";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

const courseBuilderRequestSchema = z.object({
  courseId: z.string().cuid(),
  prompt: z.string().optional(),
  replaceExisting: z.boolean().optional(),
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
    const body = courseBuilderRequestSchema.parse(await request.json());

    const prompt = (body.prompt ?? "").trim() || "Generate a premium trichology course curriculum and sales content based on the existing course title/subtitle/description. Create a clear module progression with specific lesson titles.";

    const generation = await queueContentGeneration({
      mode: "course-builder",
      courseId: body.courseId,
      replaceExisting: body.replaceExisting ?? true,
      prompt,
      media: body.image ? { kind: "image", ...body.image } : { kind: "none" },
      requestedBy: "dashboard-course-builder",
    });

    return NextResponse.json({ ok: true, generationId: generation.id, status: generation.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue course builder" },
      { status: 400 }
    );
  }
}



