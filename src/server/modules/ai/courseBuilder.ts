import "server-only";

import { prisma } from "@/server/db/client";
import { uploadToStorage } from "@/server/storage/supabase";
import OpenAI from "openai";

export type CourseBuilderResponse = {
  course: {
    title: string;
    subtitle?: string;
    description?: string;
    category?: string;
    durationMinutes?: number;
    level?: string;
    enrollmentType?: string;
    learningOutcomes: string[];
    requirements: string[];
    targetAudience: string[];
    faqs: Array<{ question: string; answer: string }>;
  };
  modules: Array<{
    title: string;
    description?: string;
    lessons: Array<{
      title: string;
      description?: string;
      content?: string;
      resources?: Array<{
        title: string;
        type: string;
        content: string;
      }>;
      knowledgeCheck?: Array<{
        question: string;
        type: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    }>;
  }>;
  heroImagePrompt?: string;
};

const COURSE_BUILDER_JSON_SCHEMA = {
  name: "course_builder_generation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      course: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          durationMinutes: { type: "number" },
          level: { type: "string" },
          enrollmentType: { type: "string" },
          learningOutcomes: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 6
          },
          requirements: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 5
          },
          targetAudience: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 4
          },
          faqs: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                question: { type: "string" },
                answer: { type: "string" }
              },
              required: ["question", "answer"]
            },
            minItems: 3,
            maxItems: 5
          }
        },
        required: ["title", "learningOutcomes", "requirements", "targetAudience", "faqs"],
      },
      modules: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            lessons: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  content: { type: "string" },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        title: { type: "string" },
                        type: { type: "string" },
                        content: { type: "string" },
                      },
                      required: ["title", "type", "content"],
                    },
                  },
                  knowledgeCheck: {
                    type: "array",
                    minItems: 3,
                    maxItems: 5,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        question: { type: "string" },
                        type: { type: "string", enum: ["MULTIPLE_CHOICE"] },
                        options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "type", "options", "correctAnswer", "explanation"],
                    },
                  },
                },
                required: ["title", "content", "knowledgeCheck"],
              },
            },
          },
          required: ["title", "lessons"],
        },
      },
      heroImagePrompt: { type: "string" },
    },
    required: ["course", "modules"],
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
            : item.content?.map((child: any) => child.text).filter(Boolean).join("\n")
        )
        .filter(Boolean)
    : [];
  return chunks.join("\n");
};

const decodeBase64 = (b64: string) => Uint8Array.from(Buffer.from(b64, "base64"));

const downloadBytes = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/png";
  return { bytes: buf, contentType };
};

export const runCourseBuilder = async (input: {
  generationId: string;
  courseId: string;
  prompt: string;
  replaceExisting?: boolean;
  imageStyle?: string;
  imageAspectRatio?: string;
}) => {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course) {
    throw new Error("Course not found for AI builder");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const basePrompt = `You are Lorraine Hawkins' lead course designer. Lorraine is a world-class trichologist.

Build a complete premium theory-based course. Each lesson must contain substantial written content that takes learners on a journey through the topic — clinical, educational, and engaging.

Lorraine's brand uses a Curry/Gold (#fab826) theme. Her tone is warm yet professional: authoritative but never cold, like a trusted mentor sharing decades of clinical experience.

Course structure:
- Create a clear module progression that builds knowledge logically.
- Each module should have 2-4 lessons.
- Each lesson title should be specific and compelling.

Lesson content requirements (the "content" field):
- Write 500-1000 words of in-depth theory per lesson using markdown formatting.
- Structure content with ## subheadings, **bold** key terms, bullet points, and > blockquotes for clinical tips.
- Open each lesson by setting the scene — why this topic matters to the learner's practice.
- Include practical, real-world examples and clinical scenarios.
- End each lesson with key takeaways or a brief reflection prompt.
- Write as Lorraine would teach: knowledgeable, caring, and practical.
- Content should stand alone as a complete learning experience without requiring video.

Lesson resources (the "resources" array):
- Each lesson should have 1 practical resource in its "resources" array.
- Resource types: "checklist", "template", "framework", "worksheet", or "quick-reference".
- Each resource has a title, type, and content (markdown-formatted text that could be printed).
- Resources should be actionable tools learners can use in their practice — checklists, templates, reference cards, or worksheets with fill-in fields.

Knowledge check (the "knowledgeCheck" array):
- Each lesson MUST have 3-4 multiple choice questions in its "knowledgeCheck" array.
- Each question tests a key concept from the lesson content.
- Each has: question (string), type ("MULTIPLE_CHOICE"), options (array of exactly 4 strings), correctAnswer (0-based index of the correct option), explanation (1-2 sentences explaining why the correct answer is right).
- Questions should be clinical and practical, not trivial. Avoid trick questions.

Sales content:
- Generate high-quality sales copy for Outcomes, Requirements, and FAQs.
- For the Hero Image Prompt: Describe a restorative, luxury clinical setting with warm highlights, soft diffused lighting, and a high-end trichology feel. Mention Curry/Gold accents.

Return JSON only.

Course context:
- Current title: ${course.title}
- Current subtitle: ${course.subtitle ?? "—"}
- Current description: ${course.description ?? "—"}
- Category: ${course.category ?? "—"}
- Delivery: ${course.enrollmentType}
- Existing learning outcomes: ${(course.learningOutcomes ?? []).slice(0, 8).join(" | ") || "—"}
- Existing requirements: ${(course.requirements ?? []).slice(0, 8).join(" | ") || "—"}
- Existing target audience: ${(course.targetAudience ?? []).slice(0, 8).join(" | ") || "—"}

User brief:
${input.prompt}`.trim();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: basePrompt,
    response_format: { type: "json_schema", json_schema: COURSE_BUILDER_JSON_SCHEMA as any },
  });

  const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
  const structured = safeJsonParse<CourseBuilderResponse>(outputText);
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

  await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id: input.courseId },
      data: {
        title: structured.course.title,
        subtitle: structured.course.subtitle ?? course.subtitle ?? undefined,
        description: structured.course.description ?? course.description ?? undefined,
        category: structured.course.category ?? course.category ?? undefined,
        durationMinutes:
          typeof structured.course.durationMinutes === "number"
            ? structured.course.durationMinutes
            : course.durationMinutes ?? undefined,
        learningOutcomes: structured.course.learningOutcomes,
        requirements: structured.course.requirements,
        targetAudience: structured.course.targetAudience,
        faqs: structured.course.faqs as any,
      },
    });

    if (input.replaceExisting) {
      await tx.courseLesson.deleteMany({ where: { module: { courseId: input.courseId } } });
      await tx.courseModule.deleteMany({ where: { courseId: input.courseId } });
    }

    for (let m = 0; m < structured.modules.length; m += 1) {
      const mod = structured.modules[m];
      const createdModule = await tx.courseModule.create({
        data: {
          courseId: input.courseId,
          title: mod.title,
          description: mod.description ?? undefined,
          position: m,
        },
      });

      for (let l = 0; l < mod.lessons.length; l += 1) {
        const lesson = mod.lessons[l];
        await tx.courseLesson.create({
          data: {
            moduleId: createdModule.id,
            title: lesson.title,
            description: lesson.description ?? undefined,
            position: l,
            content: lesson.content
              ? {
                  text: lesson.content,
                  ...(lesson.resources?.length ? { resources: lesson.resources } : {}),
                  ...(lesson.knowledgeCheck?.length ? { knowledgeCheck: lesson.knowledgeCheck } : {}),
                }
              : undefined,
          },
        });
      }
    }
  });

  if (structured.heroImagePrompt) {
    try {
      const imageResponse = await (client.images as any)?.generate({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt: structured.heroImagePrompt,
        size: (input.imageAspectRatio ?? "1:1") === "16:9" ? "1792x1024" : "1024x1024",
        style: input.imageStyle,
        // Prefer base64 if supported
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
        const path = `courses/${input.courseId}/hero/ai-${Date.now()}.png`;
        await uploadToStorage({ path, bytes, contentType, upsert: true });

        const media = await prisma.mediaAsset.create({
          data: {
            title: `${structured.course.title} hero`,
            path,
            mimeType: contentType,
            sizeBytes: bytes.length,
          },
        });

        await prisma.course.update({
          where: { id: input.courseId },
          data: { heroMediaId: media.id },
        });
      }
    } catch (imageErr) {
      // Non-fatal: course + curriculum still applied.
      console.error("[ai:course-builder:image] Failed", imageErr);
    }
  }

  return structured;
};



