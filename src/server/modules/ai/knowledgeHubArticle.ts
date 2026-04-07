import crypto from "crypto";
import OpenAI from "openai";
import { getPublicUrl, uploadToStorage } from "@/server/storage/supabase";

export type ArticleContentSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

const KNOWLEDGE_HUB_ARTICLE_JSON_SCHEMA = {
  name: "knowledge_hub_article",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      slug: { type: "string" },
      summary: { type: "string" },
      readTime: { type: "string" },
      category: { type: "string" },
      sections: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              enum: ["paragraph", "heading", "subheading", "list", "callout"],
            },
            text: { type: "string" },
            items: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["type", "text", "items"],
        },
      },
    },
    required: ["title", "slug", "summary", "readTime", "category", "sections"],
  },
};

function extractResponseText(response: { output?: unknown }): string {
  if (!response?.output) {
    return "";
  }

  const chunks = Array.isArray(response.output)
    ? response.output
        .map((item: unknown) => {
          const o = item as Record<string, unknown>;
          if (o.type === "output_text" && typeof o.text === "string") {
            return o.text;
          }
          const content = o.content as Array<{ text?: string }> | undefined;
          return content?.map((child) => child.text).filter(Boolean).join("\n") ?? "";
        })
        .filter(Boolean)
    : [];

  return chunks.join("\n");
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

type RawSection = {
  type: string;
  text?: string;
  items?: string[];
};

export function normalizeArticleSections(raw: RawSection[]): ArticleContentSection[] {
  const out: ArticleContentSection[] = [];

  for (const row of raw) {
    if (!row || typeof row !== "object") continue;

    if (row.type === "list") {
      const items = Array.isArray(row.items)
        ? row.items.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [];
      out.push({ type: "list", items: items.length ? items : [""] });
      continue;
    }

    if (
      row.type === "paragraph" ||
      row.type === "heading" ||
      row.type === "subheading" ||
      row.type === "callout"
    ) {
      out.push({
        type: row.type,
        text: typeof row.text === "string" ? row.text : "",
      });
      continue;
    }
  }

  return out.length ? out : [{ type: "paragraph", text: "" }];
}

type DraftJson = {
  title?: string;
  slug?: string;
  summary?: string;
  readTime?: string;
  category?: string;
  sections?: RawSection[];
};

export type KnowledgeHubDraftResult = {
  title: string;
  slug: string;
  summary: string;
  readTime: string;
  category?: string;
  sections: ArticleContentSection[];
};

export async function generateKnowledgeHubArticleDraft(input: {
  title?: string;
  category: string;
  prompt?: string;
}): Promise<KnowledgeHubDraftResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });

  const userParts = [
    `Category: ${input.category}`,
    input.title?.trim() ? `Working title: ${input.title.trim()}` : null,
    input.prompt?.trim() ? `Author instructions:\n${input.prompt.trim()}` : null,
    "Write a full Knowledge Hub article. Use several sections: at least one heading, multiple paragraphs, and a list where it helps readers scan key points.",
    "Slug must be lowercase kebab-case, URL-safe, no leading slash.",
    "readTime should look like '5 min read' or '8 min read'.",
    "Include category in the JSON: reuse the category given above if it still fits, or a concise alternative label (a few words).",
  ].filter(Boolean);

  const finalPrompt = `You are writing blog content for Lorraine Hawkins, an expert trichologist. Tone: warm, clinical, evidence-based, practical. No hype or miracle claims.

${userParts.join("\n\n")}`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: finalPrompt,
    text: {
      format: {
        type: "json_schema",
        name: KNOWLEDGE_HUB_ARTICLE_JSON_SCHEMA.name,
        schema: KNOWLEDGE_HUB_ARTICLE_JSON_SCHEMA.schema,
      },
    } as any,
  });

  const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
  const parsed = safeJsonParse<DraftJson>(outputText);
  if (!parsed) {
    throw new Error("AI returned invalid JSON for article draft.");
  }

  const sections = normalizeArticleSections(parsed.sections ?? []);

  return {
    title: (parsed.title ?? input.title ?? "Untitled article").trim() || "Untitled article",
    slug: (parsed.slug ?? "").trim() || "article",
    summary: (parsed.summary ?? "").trim(),
    readTime: (parsed.readTime ?? "5 min read").trim() || "5 min read",
    category: (parsed.category ?? input.category).trim() || undefined,
    sections,
  };
}

function mapAspectRatioToSize(ratio?: string) {
  switch ((ratio ?? "16:9").toLowerCase()) {
    case "9:16":
      return "1024x1792";
    case "16:9":
      return "1792x1024";
    case "4:5":
      return "1024x1280";
    default:
      return "1024x1024";
  }
}

async function uploadImageFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get("content-type") || "image/png";
  const extension = contentType.split("/")[1] || "png";
  const filename = `knowledge-hub/generated/${crypto.randomUUID()}.${extension}`;
  const { path } = await uploadToStorage({
    path: filename,
    bytes,
    contentType,
  });

  return getPublicUrl(path);
}

export async function generateKnowledgeHubHeroImage(input: {
  title: string;
  category?: string;
  prompt?: string;
}): Promise<{ heroUrl: string; imagePrompt: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });

  const context = [
    `Article title: ${input.title.trim()}`,
    input.category ? `Category: ${input.category}` : null,
    input.prompt?.trim() ? `Extra direction: ${input.prompt.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const promptResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert prompt engineer for image generation. Create one concise, descriptive prompt for a premium editorial hero image about scalp and hair health, trichology, or clinical consultation aesthetics. Photorealistic or soft editorial style. No text, logos, or watermarks in the image. Single paragraph only.",
      },
      { role: "user", content: context },
    ],
  });

  const imagePrompt = promptResponse.choices[0]?.message?.content?.trim();
  if (!imagePrompt) {
    throw new Error("Failed to generate image prompt.");
  }

  const imageResponse = await (client.images as any).generate({
    model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
    prompt: imagePrompt,
    size: mapAspectRatioToSize("16:9"),
  });

  const openaiUrl = imageResponse?.data?.[0]?.url as string | undefined;
  if (!openaiUrl) {
    throw new Error("No image URL returned from the image model.");
  }

  try {
    const heroUrl = await uploadImageFromUrl(openaiUrl);
    return { heroUrl, imagePrompt };
  } catch {
    return { heroUrl: openaiUrl, imagePrompt };
  }
}
