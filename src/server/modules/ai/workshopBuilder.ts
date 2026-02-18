import "server-only";

import { prisma } from "@/server/db/client";
import { uploadToStorage } from "@/server/storage/supabase";
import OpenAI from "openai";

export type WorkshopBuilderResponse = {
  workshop: {
    title: string;
    headline?: string;
    summary?: string;
    longDescription?: string;
    duration?: string;
    investment?: string;
    location?: string;
    outcomes: string[];
    whoItsFor: string[];
    whatYouGet: string[];
    agenda: Array<{ title: string; description: string }>;
    faqs: Array<{ question: string; answer: string }>;
    testimonials: Array<{ quote: string; author: string; role: string }>;
    ctaLabel?: string;
    ctaHref?: string;
  };
  heroImagePrompt?: string;
};

const WORKSHOP_BUILDER_JSON_SCHEMA = {
  name: "workshop_builder_generation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      workshop: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          headline: { type: "string" },
          summary: { type: "string" },
          longDescription: { type: "string" },
          duration: { type: "string" },
          investment: { type: "string" },
          location: { type: "string" },
          outcomes: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 8,
          },
          whoItsFor: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 5,
          },
          whatYouGet: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 8,
          },
          agenda: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "description"],
            },
            minItems: 2,
            maxItems: 4,
          },
          faqs: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                question: { type: "string" },
                answer: { type: "string" },
              },
              required: ["question", "answer"],
            },
            minItems: 3,
            maxItems: 6,
          },
          testimonials: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                quote: { type: "string" },
                author: { type: "string" },
                role: { type: "string" },
              },
              required: ["quote", "author", "role"],
            },
            minItems: 2,
            maxItems: 3,
          },
          ctaLabel: { type: "string" },
          ctaHref: { type: "string" },
        },
        required: [
          "title",
          "headline",
          "summary",
          "longDescription",
          "outcomes",
          "whoItsFor",
          "whatYouGet",
          "agenda",
          "faqs",
          "testimonials",
        ],
      },
      heroImagePrompt: { type: "string" },
    },
    required: ["workshop"],
  },
} as const;

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const extractResponseText = (response: any) => {
  if (!response?.output) return "";
  const chunks = Array.isArray(response.output)
    ? response.output
        .map((item: any) =>
          item.type === "output_text"
            ? item.text
            : item.content
                ?.map((child: any) => child.text)
                .filter(Boolean)
                .join("\n")
        )
        .filter(Boolean)
    : [];
  return chunks.join("\n");
};

const decodeBase64 = (b64: string) =>
  Uint8Array.from(Buffer.from(b64, "base64"));

const downloadBytes = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/png";
  return { bytes: buf, contentType };
};

export const runWorkshopBuilder = async (input: {
  generationId: string;
  workshopId: string;
  prompt: string;
  imageStyle?: string;
  imageAspectRatio?: string;
}) => {
  const workshop = await prisma.workshop.findUnique({
    where: { id: input.workshopId },
  });
  if (!workshop) {
    throw new Error("Workshop not found for AI builder");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const basePrompt = `You are Lorraine Hawkins' lead training content designer. Lorraine is a world-class trichologist who delivers in-person workshops and training for salon professionals.

Generate a complete sales page for an in-person workshop. The page needs to be persuasive, professional, and drive bookings. It should feel premium yet approachable — clinical confidence meets real-world salon practice.

Lorraine's brand:
- Warm gold/curry (#fab826) accents
- Professional yet approachable tone
- Evidence-based, practical, hands-on
- Testimonials should feel authentic and specific

Workshop details:
- Current title: ${workshop.title}
- Current headline: ${workshop.headline ?? "—"}
- Current summary: ${workshop.summary ?? "—"}
- Duration: ${workshop.duration ?? "—"}
- Investment: ${workshop.investment ?? "—"}
- Location: ${workshop.location ?? "—"}
- Current outcomes: ${(workshop.outcomes ?? []).slice(0, 8).join(" | ") || "—"}

Instructions:
- Write a punchy, benefit-driven headline (not the title)
- Write a brief summary (1-2 sentences for card display)
- Write a persuasive long description (2-3 paragraphs with line breaks)
- Create 4-6 specific learning outcomes
- List who this workshop is for (3-4 bullet points)
- List what's included / what they get (5-7 items)
- Create a day-by-day or session-by-session agenda (2-3 sessions)
- Write 4-5 realistic FAQs with helpful answers
- Create 2 realistic testimonials from fictional past attendees (use realistic UK names)
- Suggest a CTA label and link path
- For the hero image prompt: describe a warm, professional training environment with Lorraine teaching, gold lighting accents, and a premium trichology feel

User brief:
${input.prompt}

Return JSON only.`.trim();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: basePrompt,
    text: {
      format: {
        type: "json_schema",
        name: WORKSHOP_BUILDER_JSON_SCHEMA.name,
        schema: WORKSHOP_BUILDER_JSON_SCHEMA.schema,
      },
    } as any,
  });

  const outputText =
    extractResponseText(response) ||
    JSON.stringify(response.output ?? {});
  const structured = safeJsonParse<WorkshopBuilderResponse>(outputText);
  if (!structured) {
    throw new Error("AI builder returned invalid JSON");
  }

  await prisma.generatedContent.update({
    where: { id: input.generationId },
    data: {
      status: "COMPLETED",
      output: structured as any,
      usage: response.usage as any,
    },
  });

  await prisma.workshop.update({
    where: { id: input.workshopId },
    data: {
      title: structured.workshop.title,
      headline: structured.workshop.headline ?? workshop.headline ?? undefined,
      summary: structured.workshop.summary ?? workshop.summary ?? undefined,
      longDescription:
        structured.workshop.longDescription ??
        workshop.longDescription ??
        undefined,
      duration:
        structured.workshop.duration ?? workshop.duration ?? undefined,
      investment:
        structured.workshop.investment ?? workshop.investment ?? undefined,
      location:
        structured.workshop.location ?? workshop.location ?? undefined,
      outcomes: structured.workshop.outcomes,
      whoItsFor: structured.workshop.whoItsFor,
      whatYouGet: structured.workshop.whatYouGet,
      agenda: structured.workshop.agenda as any,
      faqs: structured.workshop.faqs as any,
      testimonials: structured.workshop.testimonials as any,
      ctaLabel:
        structured.workshop.ctaLabel ?? workshop.ctaLabel ?? undefined,
      ctaHref: structured.workshop.ctaHref ?? workshop.ctaHref ?? undefined,
    },
  });

  if (structured.heroImagePrompt) {
    try {
      const imageResponse = await (client.images as any)?.generate({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt: structured.heroImagePrompt,
        size:
          (input.imageAspectRatio ?? "16:9") === "1:1"
            ? "1024x1024"
            : "1792x1024",
        style: input.imageStyle,
        response_format: "b64_json",
      });

      const item = imageResponse?.data?.[0];
      let bytes: Uint8Array | null = null;
      let contentType = "image/png";

      if (item?.b64_json) {
        bytes = decodeBase64(item.b64_json);
      } else if (item?.url) {
        const downloaded = await downloadBytes(item.url);
        bytes = downloaded.bytes;
        contentType = downloaded.contentType;
      }

      if (bytes) {
        const path = `workshops/${input.workshopId}/hero/ai-${Date.now()}.png`;
        await uploadToStorage({ path, bytes, contentType, upsert: true });

        const media = await prisma.mediaAsset.create({
          data: {
            title: `${structured.workshop.title} hero`,
            path,
            mimeType: contentType,
            sizeBytes: bytes.length,
          },
        });

        await prisma.workshop.update({
          where: { id: input.workshopId },
          data: { heroMediaId: media.id },
        });
      }
    } catch (imageErr) {
      console.error("[ai:workshop-builder:image] Failed", imageErr);
    }
  }

  return structured;
};
