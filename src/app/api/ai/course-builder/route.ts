import { NextResponse } from "next/server";
import { z } from "zod";
import { queueContentGeneration } from "@/server/modules/ai/service";
import { runCourseBuilder } from "@/server/modules/ai/courseBuilder";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

    let generationId: string;
    let status: string;

    try {
      const generation = await queueContentGeneration({
        mode: "course-builder",
        courseId: body.courseId,
        replaceExisting: body.replaceExisting ?? true,
        prompt,
        media: body.image ? { kind: "image", ...body.image } : { kind: "none" },
        requestedBy: "dashboard-course-builder",
      });
      generationId = generation.id;
      status = generation.status;
    } catch (queueErr) {
      const msg = queueErr instanceof Error ? queueErr.message : "";
      const isRedisDown =
        msg.includes("ECONNREFUSED") || msg.includes("Redis") || msg.includes("unavailable");

      if (!isRedisDown) throw queueErr;

      // Redis unavailable -- run the course builder in the background so we can return immediately for progress polling
      const generation = await prisma.generatedContent.create({
        data: {
          requestedBy: "dashboard-course-builder",
          input: { prompt, brief: { mode: "course-builder", courseId: body.courseId, replaceExisting: body.replaceExisting ?? true, media: body.image ? { kind: "image", ...body.image } : { kind: "none" } } },
          status: "PROCESSING",
        },
      });

      runCourseBuilder({
        generationId: generation.id,
        courseId: body.courseId,
        prompt,
        replaceExisting: body.replaceExisting ?? true,
        imageAspectRatio: body.image?.aspectRatio,
        imageStyle: body.image?.style,
      }).catch(async (err) => {
        await prisma.generatedContent.update({
          where: { id: generation.id },
          data: { status: "FAILED", error: err instanceof Error ? err.message : String(err) },
        });
      });

      generationId = generation.id;
      status = "PROCESSING";
    }

    return NextResponse.json({ ok: true, generationId, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue course builder" },
      { status: 400 }
    );
  }
}



