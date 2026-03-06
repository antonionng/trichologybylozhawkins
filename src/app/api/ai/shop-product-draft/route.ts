import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { requireUser } from "@/server/security/auth";

const requestSchema = z.object({
  prompt: z.string().min(10, "Please provide a bit more product context."),
});

const draftSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  perfectFor: z.string().optional().default(""),
  ingredients: z.string().optional().default(""),
  keyIngredients: z.array(z.string()).default([]),
  priceSuggestion: z.number().nonnegative().default(0),
});

const jsonSchema = {
  name: "shop_product_draft",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      shortDescription: { type: "string" },
      description: { type: "string" },
      perfectFor: { type: "string" },
      ingredients: { type: "string" },
      keyIngredients: { type: "array", items: { type: "string" } },
      priceSuggestion: { type: "number" },
    },
    required: ["name", "slug", "shortDescription", "description", "keyIngredients", "priceSuggestion"],
  },
} as const;

const extractResponseText = (response: any) => {
  if (!Array.isArray(response?.output)) return "";
  return response.output
    .map((item: any) => (item?.type === "output_text" ? item?.text : ""))
    .filter(Boolean)
    .join("\n");
};

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = requestSchema.parse(await request.json());

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        "You are creating premium trichology product copy for Lorraine Hawkins.",
        "Return strict JSON matching the provided schema.",
        "Constraints:",
        "- Keep tone professional and practical.",
        "- Slug must be lowercase, numbers, and hyphens only.",
        "- priceSuggestion should be a realistic GBP number.",
        "",
        `Product concept: ${body.prompt}`,
      ].join("\n"),
      text: {
        format: {
          type: "json_schema",
          name: jsonSchema.name,
          schema: jsonSchema.schema,
        },
      } as any,
    });

    const text = extractResponseText(response);
    const parsed = draftSchema.parse(JSON.parse(text));
    return NextResponse.json({ draft: parsed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate product draft" },
      { status: 400 },
    );
  }
}
