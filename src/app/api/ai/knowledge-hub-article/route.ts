import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/security/auth";
import {
  generateKnowledgeHubArticleDraft,
  generateKnowledgeHubHeroImage,
} from "@/server/modules/ai/knowledgeHubArticle";

export const dynamic = "force-dynamic";

const draftBodySchema = z.object({
  kind: z.literal("draft"),
  category: z.string().min(1),
  title: z.string().optional(),
  prompt: z.string().optional(),
});

const heroBodySchema = z.object({
  kind: z.literal("hero"),
  title: z.string().min(1),
  category: z.string().optional(),
  prompt: z.string().optional(),
});

const bodySchema = z.discriminatedUnion("kind", [draftBodySchema, heroBodySchema]);

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const json = await request.json();
    const body = bodySchema.parse(json);

    if (body.kind === "draft") {
      const draft = await generateKnowledgeHubArticleDraft({
        category: body.category,
        title: body.title,
        prompt: body.prompt,
      });
      return NextResponse.json({ ok: true, draft });
    }

    const hero = await generateKnowledgeHubHeroImage({
      title: body.title,
      category: body.category,
      prompt: body.prompt,
    });
    return NextResponse.json({ ok: true, heroUrl: hero.heroUrl, imagePrompt: hero.imagePrompt });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Knowledge Hub AI generation failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : error instanceof z.ZodError
            ? 400
            : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
