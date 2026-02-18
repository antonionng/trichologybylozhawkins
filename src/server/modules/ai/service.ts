import { aiQueue } from "@/server/jobs/queues";
import { prisma } from "@/server/db/client";
import {
  attachGenerationToSlot,
  upsertAssetVariant,
  updateContentSlotStatus,
} from "@/server/modules/contentFactory/service";
import { runCourseBuilder } from "@/server/modules/ai/courseBuilder";
import { runWorkshopBuilder } from "@/server/modules/ai/workshopBuilder";
import { generateContentSchema, promptTemplateSchema } from "@/server/schema";
import {
  AIProvider,
  AssetVariantStatus,
  ContentAssetType,
  ContentChannel,
  ContentSlotStatus,
  GenerationStatus,
} from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import crypto from "crypto";
import { getPublicUrl, uploadToStorage } from "@/server/storage/supabase";

type ContentBrief = {
  mode?: string;
  slotId?: string;
  courseId?: string;
  videoProductId?: string;
  replaceExisting?: boolean;
  persona?: string;
  campaign?: string;
  tone?: string[];
  channels?: ContentChannel[];
  goals?: string[];
  variants?: number;
  media?: {
    kind?: string;
    aspectRatio?: string;
    style?: string;
    referenceUrls?: string[];
  };
};

type ContentFactoryVariant = {
  platform?: string;
  headline?: string;
  hook?: string;
  caption: string;
  cta?: string;
  hashtags?: string[];
};

type ContentFactoryImagePrompt = {
  prompt: string;
  aspectRatio?: string;
  style?: string;
};

type ContentFactoryResponse = {
  summary?: string;
  copyVariants: ContentFactoryVariant[];
  imagePrompts?: ContentFactoryImagePrompt[];
};

type VideoProductPagesResponse = {
  publicPage: {
    headline: string;
    intro: string;
    benefits: string[];
    learningOutcomes: string[];
    faqs: Array<{ question: string; answer: string }>;
  };
  memberPage: {
    notes: string;
    keyTakeaways: string[];
    nextSteps: string[];
  };
  suggestedUpdates?: {
    subtitle?: string;
    description?: string;
  };
};

const CONTENT_FACTORY_JSON_SCHEMA = {
  name: "content_factory_generation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      copyVariants: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            platform: { type: "string" },
            headline: { type: "string" },
            hook: { type: "string" },
            caption: { type: "string" },
            cta: { type: "string" },
            hashtags: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["caption"],
        },
      },
      imagePrompts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            prompt: { type: "string" },
            aspectRatio: { type: "string" },
            style: { type: "string" },
          },
          required: ["prompt"],
        },
      },
    },
    required: ["copyVariants"],
  },
};

const VIDEO_PRODUCT_PAGES_JSON_SCHEMA = {
  name: "video_product_pages",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      publicPage: {
        type: "object",
        additionalProperties: false,
        properties: {
          headline: { type: "string" },
          intro: { type: "string" },
          benefits: { type: "array", items: { type: "string" } },
          learningOutcomes: { type: "array", items: { type: "string" } },
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
          },
        },
        required: ["headline", "intro", "benefits", "learningOutcomes", "faqs"],
      },
      memberPage: {
        type: "object",
        additionalProperties: false,
        properties: {
          notes: { type: "string" },
          keyTakeaways: { type: "array", items: { type: "string" } },
          nextSteps: { type: "array", items: { type: "string" } },
        },
        required: ["notes", "keyTakeaways", "nextSteps"],
      },
      suggestedUpdates: {
        type: "object",
        additionalProperties: false,
        properties: {
          subtitle: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    required: ["publicPage", "memberPage"],
  },
};

const buildContentFactoryPrompt = (basePrompt: string, brief?: ContentBrief) => {
  const channelList = brief?.channels?.join(", ") ?? "GENERIC";
  const tone = brief?.tone?.join(", ") ?? "warm, expert, actionable";
  const goals = brief?.goals?.join(", ") ?? "awareness";
  const variants = brief?.variants ?? 1;
  const persona = brief?.persona ?? "general audience";

  return `You are Lorraine Hawkins' content strategist. Draft ${variants} platform-ready posts targeting ${persona}.

Channels: ${channelList}
Tone: ${tone}
Goals: ${goals}

Return JSON that matches the schema provided. Include platform-specific hooks, captions, CTAs, and hashtags when useful. Base brief:
${basePrompt}`.trim();
};

const extractResponseText = (response: any) => {
  if (!response?.output) {
    return "";
  }

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

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalizeChannel = (
  value?: string,
  fallback: ContentChannel = ContentChannel.GENERIC
): ContentChannel => {
  if (!value) {
    return fallback;
  }

  const upper = value.toUpperCase();
  const match = Object.values(ContentChannel).find((channel) => channel === upper);
  return (match as ContentChannel) ?? fallback;
};

const mapAspectRatioToSize = (ratio?: string) => {
  switch ((ratio ?? "1:1").toLowerCase()) {
    case "9:16":
      return "1024x1792";
    case "16:9":
      return "1792x1024";
    case "4:5":
      return "1024x1280";
    default:
      return "1024x1024";
  }
};

const promptTemplateMutationSchema = promptTemplateSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertPromptTemplate = async (
  input: z.infer<typeof promptTemplateMutationSchema>
) => {
  const data = promptTemplateMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.promptTemplate.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.promptTemplate.create({
    data: payload,
  });
};

export const listPromptTemplates = async () => {
  return prisma.promptTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export const queueContentGeneration = async (
  input: z.infer<typeof generateContentSchema>
) => {
  const data = generateContentSchema.parse(input);

  if (data.templateId) {
    const template = await prisma.promptTemplate.findUnique({
      where: { id: data.templateId },
    });
    if (!template) {
      throw new Error("Selected template no longer exists. Please refresh the page.");
    }
  }

  const brief = {
    mode: data.mode ?? "freeform",
    slotId: data.slotId,
    courseId: data.courseId,
    workshopId: data.workshopId,
    replaceExisting: data.replaceExisting,
    persona: data.persona,
    campaign: data.campaign,
    tone: data.tone,
    channels: data.channels,
    goals: data.goals,
    variants: data.variants,
    media: data.media,
  };

  const generation = await prisma.generatedContent.create({
    data: {
      templateId: data.templateId,
      requestedBy: data.requestedBy,
      input: {
        prompt: data.prompt,
        ...(data.input ?? {}),
        brief,
      },
      status: GenerationStatus.PENDING,
    },
  });

  try {
    await aiQueue.add(
      "generate-content",
      { generationId: generation.id },
      { removeOnComplete: true, attempts: 2 }
    );
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const isConnRefused =
      raw.includes("ECONNREFUSED") ||
      raw.includes("connect ECONNREFUSED") ||
      raw.toLowerCase().includes("redis");

    if (process.env.NODE_ENV !== "production" && isConnRefused) {
      throw new Error(
        [
          "AI queue is unavailable (Redis is not reachable).",
          "Start Redis and try again:",
          "  docker compose up -d redis",
          "",
          `Details: ${raw}`,
        ].join("\n")
      );
    }

    throw new Error(raw || "Failed to queue content generation");
  }

  return generation;
};

export const listGenerations = async (limit = 20) => {
  return prisma.generatedContent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      template: true,
    },
  });
};

export const runGeneration = async (generationId: string) => {
  const generation = await prisma.generatedContent.findUnique({
    where: { id: generationId },
    include: { template: true },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  const template = generation.template;

  const inputPayload = (generation.input ?? {}) as Record<string, unknown>;
  const brief = inputPayload.brief as ContentBrief | undefined;
  const promptSource = template
    ? template.template?.includes("{{prompt}}")
      ? template.template.replace("{{prompt}}", String(inputPayload.prompt ?? ""))
      : template.template
    : undefined;
  const basePrompt = promptSource || String(inputPayload.prompt ?? "");

  if (!basePrompt) {
    throw new Error("No prompt available for generation.");
  }

  const wantsContentFactory = brief?.mode === "content-factory";
  const wantsCourseBuilder = brief?.mode === "course-builder";
  const wantsVideoProductPages =
    brief?.mode === "video-product-pages" && Boolean(brief?.videoProductId);
  const finalPrompt = wantsContentFactory
    ? buildContentFactoryPrompt(basePrompt, brief)
    : basePrompt;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    if (wantsCourseBuilder && brief?.courseId) {
      await prisma.generatedContent.update({
        where: { id: generationId },
        data: { status: GenerationStatus.PROCESSING },
      });

      const structured = await runCourseBuilder({
        generationId,
        courseId: brief.courseId,
        prompt: finalPrompt,
        replaceExisting: brief.replaceExisting,
        imageAspectRatio: brief.media?.aspectRatio,
        imageStyle: brief.media?.style,
      });

      return structured as any;
    }

    const wantsWorkshopBuilder = brief?.mode === "workshop-builder";
    if (wantsWorkshopBuilder && brief?.workshopId) {
      await prisma.generatedContent.update({
        where: { id: generationId },
        data: { status: GenerationStatus.PROCESSING },
      });

      const structured = await runWorkshopBuilder({
        generationId,
        workshopId: brief.workshopId,
        prompt: finalPrompt,
        imageAspectRatio: brief.media?.aspectRatio,
        imageStyle: brief.media?.style,
      });

      return structured as any;
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: finalPrompt,
      ...(wantsContentFactory || wantsVideoProductPages
        ? {
            text: {
              format: {
                type: "json_schema",
                name: wantsContentFactory
                  ? CONTENT_FACTORY_JSON_SCHEMA.name
                  : VIDEO_PRODUCT_PAGES_JSON_SCHEMA.name,
                schema: wantsContentFactory
                  ? CONTENT_FACTORY_JSON_SCHEMA.schema
                  : VIDEO_PRODUCT_PAGES_JSON_SCHEMA.schema,
              },
            } as any,
          }
        : {}),
    });

    const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
    const structuredContentFactory = wantsContentFactory
      ? safeJsonParse<ContentFactoryResponse>(outputText)
      : null;
    const structuredVideoPages = wantsVideoProductPages
      ? safeJsonParse<VideoProductPagesResponse>(outputText)
      : null;

    const updatedGeneration = await prisma.generatedContent.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.COMPLETED,
        output: (structuredContentFactory ?? structuredVideoPages) ?? { text: outputText },
        usage: response.usage as unknown as Record<string, unknown>,
      },
    });

    if (wantsVideoProductPages && brief?.videoProductId && structuredVideoPages) {
      await prisma.videoProduct.update({
        where: { id: brief.videoProductId },
        data: {
          subtitle: structuredVideoPages.suggestedUpdates?.subtitle ?? undefined,
          description: structuredVideoPages.suggestedUpdates?.description ?? undefined,
          publicContent: structuredVideoPages.publicPage as any,
          memberContent: structuredVideoPages.memberPage as any,
        },
      });
    }

    if (wantsContentFactory && brief?.slotId && structuredContentFactory) {
      const asset = await attachGenerationToSlot({
        slotId: brief.slotId,
        generationId,
        type: ContentAssetType.COPY,
        title: template?.name ?? structuredContentFactory.summary ?? "Content Draft",
        summary: structuredContentFactory.summary,
        metadata: {
          persona: brief.persona,
          campaign: brief.campaign,
          tone: brief.tone,
          goals: brief.goals,
          channels: brief.channels,
        },
        prompt: {
          basePrompt,
          finalPrompt,
        },
      });

      if (structuredContentFactory.copyVariants?.length) {
        for (const variant of structuredContentFactory.copyVariants) {
          if (!variant.caption) continue;

          await upsertAssetVariant({
            assetId: asset.id,
            platform: normalizeChannel(
              variant.platform,
              brief.channels?.[0] ?? ContentChannel.GENERIC
            ),
            status: AssetVariantStatus.DRAFT,
            headline: variant.headline ?? variant.hook,
            copy: variant.caption,
            cta: variant.cta,
            hashtags: variant.hashtags,
            metadata: variant.hook ? { hook: variant.hook } : undefined,
          });
        }
      }

      if (brief.media?.kind === "image" && structuredContentFactory.imagePrompts?.length) {
        await Promise.all(
          structuredContentFactory.imagePrompts.map(async (imagePrompt) => {
            try {
              const imageResponse = await (client.images as any)?.generate({
                model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
                prompt: imagePrompt.prompt,
                size: mapAspectRatioToSize(
                  imagePrompt.aspectRatio ?? brief.media?.aspectRatio
                ),
                style: imagePrompt.style ?? brief.media?.style,
              });

              const url = imageResponse?.data?.[0]?.url;
              if (!url) {
                return;
              }

              await prisma.contentAsset.create({
                data: {
                  slotId: brief.slotId,
                  generationId,
                  type: ContentAssetType.IMAGE,
                  mediaUrl: url,
                  metadata: {
                    prompt: imagePrompt.prompt,
                    aspectRatio: imagePrompt.aspectRatio ?? brief.media?.aspectRatio,
                    style: imagePrompt.style ?? brief.media?.style,
                  },
                },
              });
            } catch (imageError) {
              console.error("[ai:image-generation] Failed", imageError);
            }
          })
        );
      }

      await updateContentSlotStatus(brief.slotId, ContentSlotStatus.NEEDS_REVIEW);
    }

    return updatedGeneration;
  } catch (error) {
    const failure = await prisma.generatedContent.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    if (brief?.slotId) {
      await updateContentSlotStatus(brief.slotId, ContentSlotStatus.DRAFT);
    }

    return failure;
  }
};

export const executeTemplatePreview = async (input: {
  templateId?: string;
  prompt: string;
}) => {
  const { templateId, prompt } = input;
  let promptText = prompt;

  if (templateId) {
    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    promptText = template.template?.includes("{{prompt}}")
      ? template.template.replace("{{prompt}}", prompt)
      : template.template;
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: promptText,
  });

  const output =
    response.output?.[0]?.type === "output_text"
      ? response.output[0].text
      : JSON.stringify(response);

  return {
    output,
    usage: response.usage as unknown as Record<string, unknown>,
  };
};

/**
 * Downloads an image from a URL and uploads it to Supabase storage.
 */
async function uploadImageFromUrl(url: string, slotId: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from OpenAI: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get("content-type") || "image/png";
  const extension = contentType.split("/")[1] || "png";
  const filename = `content/${slotId}/${crypto.randomUUID()}.${extension}`;  const { path } = await uploadToStorage({
    path: filename,
    bytes,
    contentType,
  });

  return getPublicUrl(path);
}

/**
 * Triggered on post approval. Generates a high-quality image using gpt-image-1.5
 * based on the final approved copy.
 */
export async function triggerPostImageGeneration(slotId: string) {
  const slot = await prisma.contentSlot.findUnique({
    where: { id: slotId },
    include: {
      assets: {
        where: { type: ContentAssetType.COPY },
        include: { variants: true },
      },
    },
  });

  if (!slot) {
    console.warn(`[triggerPostImageGeneration] Slot ${slotId} not found`);
    return;
  }

  // Use the first approved/draft variant as copy reference
  const copyAsset = slot.assets[0];
  const variant = copyAsset?.variants[0];
  const copyText = variant?.copy || slot.brief || slot.title;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. Generate an optimized image prompt using an LLM
    const promptResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert prompt engineer for DALL-E 3. Create a highly descriptive, artistic, and photorealistic image prompt that visually represents the following social media post copy. Avoid text in the image. Focus on mood, lighting, and premium trichology/hair-health aesthetics.",
        },
        { role: "user", content: copyText },
      ],
    });

    const imagePrompt = promptResponse.choices[0]?.message?.content;
    if (!imagePrompt) {
      throw new Error("Failed to generate image prompt");
    }    // 2. Generate the image with gpt-image-1.5
    const imageResponse = await (client.images as any).generate({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });

    const openaiUrl = imageResponse?.data?.[0]?.url;
    if (!openaiUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // 3. Persist to Supabase
    const publicUrl = await uploadImageFromUrl(openaiUrl, slotId);    // 4. Save as a new asset
    await prisma.contentAsset.create({
      data: {
        slotId,
        type: ContentAssetType.IMAGE,
        mediaUrl: publicUrl,
        title: "Approved Post Image",
        summary: imagePrompt,
        metadata: {
          prompt: imagePrompt,
          source: "post-approval-generation",
          model: "gpt-image-1.5",
        },
      },
    });

    console.log(`[triggerPostImageGeneration] Successfully generated image for slot ${slotId}`);
  } catch (error) {
    console.error(`[triggerPostImageGeneration] Failed for slot ${slotId}`, error);
    throw error;
  }
}
