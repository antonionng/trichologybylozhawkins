import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";
import { runGeneration } from "@/server/modules/ai/service";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  videoProductId: z.string().cuid(),
  prompt: z.string().optional(),
});

const TEMPLATE_NAME = "video-product-pages-v1";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = requestSchema.parse(await request.json());

    const video = await prisma.videoProduct.findUnique({
      where: { id: body.videoProductId },
      select: { id: true, title: true, category: true, durationMinutes: true },
    });
    if (!video) {
      return NextResponse.json({ error: "Video product not found" }, { status: 404 });
    }

    const template =
      (await prisma.promptTemplate.findFirst({
        where: { name: TEMPLATE_NAME },
        select: { id: true },
      })) ??
      (await prisma.promptTemplate.create({
        data: {
          name: TEMPLATE_NAME,
          description: "Generate public purchase-page + member video-page content for a VideoProduct.",
          useCase: "video-product-pages",
          template: [
            "You are writing premium trichology education copy for Lorraine Hawkins.",
            "Tone: warm, clinical, confident, practical. No hype. No exaggerated claims.",
            "Write for salon professionals and learners. Keep it clear and immediately usable.",
            "",
            "Use the provided prompt as source material:",
            "{{prompt}}",
          ].join("\\n"),
          temperature: 0.7,
          provider: "OPENAI",
        },
        select: { id: true },
      }));

    const prompt =
      body.prompt?.trim() ||
      `Create public purchase-page content and member video-page notes for a video lesson titled: ${video.title}.` +
        (video.category ? ` Category: ${video.category}.` : "") +
        (video.durationMinutes ? ` Duration: ${video.durationMinutes} minutes.` : "") +
        " Include benefits, learning outcomes, FAQs, and concise member notes with next steps.";

    const generation = await prisma.generatedContent.create({
      data: {
        templateId: template.id,
        requestedBy: "dashboard-video-product-pages",
        status: "PENDING",
        input: {
          prompt,
          brief: {
            mode: "video-product-pages",
            videoProductId: body.videoProductId,
          },
        },
      },
      select: { id: true, status: true },
    });

    // Run synchronously (no Redis required). If you want background processing, wire this through the AI queue.
    await runGeneration(generation.id);

    return NextResponse.json({ ok: true, generationId: generation.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate video pages" },
      { status: 400 }
    );
  }
}

