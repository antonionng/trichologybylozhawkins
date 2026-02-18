import { AIProvider, ContentChannel, GenerationStatus } from "@prisma/client";
import { z } from "zod";

const mediaRequestSchema = z.object({
  kind: z.enum(["image", "video", "none"]).default("none"),
  aspectRatio: z.string().optional(),
  style: z.string().optional(),
  referenceUrls: z.array(z.string().url()).optional(),
});

export const promptTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  useCase: z.string().optional(),
  template: z.string().min(1),
  inputSchema: z.record(z.any()).optional(),
  outputSchema: z.record(z.any()).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  provider: z.nativeEnum(AIProvider).default(AIProvider.OPENAI),
  defaultMetadata: z.record(z.any()).optional(),
});

export const generateContentSchema = z.object({
  templateId: z.string().cuid().optional(),
  provider: z.nativeEnum(AIProvider).optional(),
  prompt: z.string().min(1),
  input: z.record(z.any()).optional(),
  requestedBy: z.string().optional(),
  mode: z.enum(["freeform", "content-factory", "course-builder", "workshop-builder"]).default("freeform").optional(),
  slotId: z.string().cuid().optional(),
  courseId: z.string().cuid().optional(),
  workshopId: z.string().cuid().optional(),
  replaceExisting: z.boolean().optional(),
  persona: z.string().optional(),
  campaign: z.string().optional(),
  tone: z.array(z.string()).optional(),
  channels: z.array(z.nativeEnum(ContentChannel)).optional(),
  goals: z.array(z.string()).optional(),
  variants: z.number().int().min(1).max(10).default(1).optional(),
  media: mediaRequestSchema.optional(),
});

export const generationFeedbackSchema = z.object({
  generationId: z.string().cuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  submittedBy: z.string().optional(),
  status: z.nativeEnum(GenerationStatus).optional(),
});

export type PromptTemplateInput = z.infer<typeof promptTemplateSchema>;

