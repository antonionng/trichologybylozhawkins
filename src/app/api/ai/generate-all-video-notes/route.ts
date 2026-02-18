import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";
import { runGeneration } from "@/server/modules/ai/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const TEMPLATE_NAME = "video-product-pages-v1";

function isEmpty(val: unknown): boolean {
  if (val == null) return true;
  if (typeof val === "object" && Object.keys(val as object).length === 0) return true;
  return false;
}

export async function POST() {
  try {
    await requireUser({ role: "ADMIN" });

    const allVideos = await prisma.videoProduct.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        durationMinutes: true,
        memberContent: true,
      },
    });

    const missing = allVideos.filter((v) => isEmpty(v.memberContent));

    if (missing.length === 0) {
      return NextResponse.json({ ok: true, generated: 0, message: "All videos already have notes." });
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

    const results: { videoId: string; title: string; ok: boolean; error?: string }[] = [];

    for (const video of missing) {
      try {
        const prompt =
          `Create public purchase-page content and member video-page notes for a video lesson titled: ${video.title}.` +
          (video.category ? ` Category: ${video.category}.` : "") +
          (video.durationMinutes ? ` Duration: ${video.durationMinutes} minutes.` : "") +
          " Include benefits, learning outcomes, FAQs, and concise member notes with next steps.";

        const generation = await prisma.generatedContent.create({
          data: {
            templateId: template.id,
            requestedBy: "bulk-video-notes",
            status: "PENDING",
            input: {
              prompt,
              brief: {
                mode: "video-product-pages",
                videoProductId: video.id,
              },
            },
          },
          select: { id: true },
        });

        await runGeneration(generation.id);
        results.push({ videoId: video.id, title: video.title, ok: true });
      } catch (e) {
        results.push({
          videoId: video.id,
          title: video.title,
          ok: false,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    return NextResponse.json({
      ok: true,
      generated: succeeded,
      failed,
      total: missing.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate video notes" },
      { status: 400 }
    );
  }
}
