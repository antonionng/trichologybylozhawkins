import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";
import { updateSlotAndVariant } from "@/server/modules/contentFactory/service";

const requestSchema = z.object({
  slotId: z.string().cuid(),
  variantId: z.string().cuid(),
  instruction: z.string().min(2).max(1000),
});

const REVISION_SCHEMA = {
  name: "content_variant_revision",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      caption: { type: "string" },
      hashtags: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["caption", "hashtags"],
  },
};

const extractResponseText = (response: any) => {
  if (!response?.output) return "";
  const chunks = Array.isArray(response.output)
    ? response.output
        .map((item: any) =>
          item.type === "output_text"
            ? item.text
            : item.content?.map((child: any) => child.text).filter(Boolean).join("\n")
        )
        .filter(Boolean)
    : [];
  return chunks.join("\n");
};

const safeJsonParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalizeHashtagsToText = (value: string[] | null | undefined) => {
  if (!value) return "";
  const normalized = value
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));
  return normalized.join(" ");
};

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = requestSchema.parse(body);

    const variant = await prisma.assetVariant.findUnique({
      where: { id: data.variantId },
      include: {
        asset: {
          include: {
            slot: true,
          },
        },
      },
    });

    if (!variant || variant.asset.slotId !== data.slotId) {
      return NextResponse.json({ error: "Variant not found for slot" }, { status: 404 });
    }

    const currentCaption = variant.copy ?? "";
    const currentHashtags = variant.hashtags ?? "";
    const platform = variant.platform;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are Lorraine Hawkins' social media editor. Revise ONE platform-ready post.

Platform: ${platform}
Instruction from user: ${data.instruction}

Current caption:
${currentCaption}

Current hashtags (space-separated):
${currentHashtags}

Rules:
- Keep the voice premium, warm, expert, and science-backed.
- Keep it ready to paste into ${platform}.
- Return a refined caption and a curated set of hashtags.
- Hashtags: 8-18 max, no duplicates, relevant to trichology/hair/scalp, avoid spammy tags.
`.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: REVISION_SCHEMA.name,
          schema: REVISION_SCHEMA.schema,
        },
      } as any,
    });

    const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
    const revised = safeJsonParse<{ caption: string; hashtags: string[] }>(outputText);
    if (!revised?.caption) {
      throw new Error("Failed to revise content");
    }

    const hashtagsText = normalizeHashtagsToText(revised.hashtags);

    const slot = await updateSlotAndVariant({
      slotId: data.slotId,
      variantId: data.variantId,
      variantPatch: {
        copy: revised.caption,
        hashtags: hashtagsText,
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revise post" },
      { status: 400 }
    );
  }
}

