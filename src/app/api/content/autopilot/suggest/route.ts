import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { requireUser } from "@/server/security/auth";

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  timezone: z.string().min(1).optional(),
});

const SUGGESTION_SCHEMA = {
  name: "autopilot_suggestions",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      brief: { type: "string" },
      themeBlocks: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            fromDay: { type: "number" },
            toDay: { type: "number" },
            theme: { type: "string" },
            notes: { type: "string" },
          },
          // OpenAI json_schema requires `required` to include EVERY key in `properties`.
          // Use empty string defaults for fields that are conceptually optional (e.g. notes: "").
          required: ["label", "fromDay", "toDay", "theme", "notes"],
        },
      },
      mix: {
        type: "object",
        additionalProperties: false,
        properties: {
          education: { type: "number" },
          authority: { type: "number" },
          sales: { type: "number" },
          community: { type: "number" },
          trends: { type: "number" },
        },
        required: ["education", "authority", "sales", "community", "trends"],
      },
      promotions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            kind: { type: "string" },
            priority: { type: "string" },
            frequency: { type: "number" },
            notes: { type: "string" },
          },
          required: ["name", "kind", "priority", "frequency", "notes"],
        },
      },
    },
    required: ["brief", "themeBlocks", "mix", "promotions"],
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

export async function GET(request: NextRequest) {
  try {
    await requireUser({ role: "ADMIN" });
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.parse({
      month: searchParams.get("month"),
      timezone: searchParams.get("timezone") ?? undefined,
    });

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a trichology marketing expert supporting Lorraine Hawkins.

Goal: Suggest a simple monthly content direction for ${parsed.month} that feels seasonal and aligned to trichology education and premium offers.

Return:
- brief: a short natural-language instruction Lorraine would give an assistant
- themeBlocks: 3-5 blocks that cover the month (fromDay/toDay/theme/notes)
- mix: recommended percentages for education/authority/sales/community/trends (optional)
- promotions: suggested promotions (optional), prioritizing courses + consultations

Keep it simple, premium, science-backed, and varied. Avoid spammy sales.
    `.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: SUGGESTION_SCHEMA.name,
          schema: SUGGESTION_SCHEMA.schema,
        },
      } as any,
    });

    const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
    const suggestions = safeJsonParse<Record<string, unknown>>(outputText);

    if (!suggestions) {
      throw new Error("Failed to parse suggestions");
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to suggest themes" },
      { status: 400 }
    );
  }
}


