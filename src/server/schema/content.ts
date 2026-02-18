import { ContentChannel, ContentSlotStatus } from "@prisma/client";
import { z } from "zod";

export const contentGenerationRequestSchema = z.object({
  slotId: z.string().cuid().optional(),
  planId: z.string().cuid().optional(),
  title: z.string().min(1),
  persona: z.string().min(1),
  campaign: z.string().min(1),
  channels: z.array(z.nativeEnum(ContentChannel)).min(1),
  tone: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  variants: z.number().int().min(1).max(10).default(1).optional(),
  includeImages: z.boolean().default(true),
  prompt: z.string().min(1),
  scheduledFor: z
    .union([z.string().datetime(), z.date()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    }),
  mode: z.enum(["freeform", "template", "manual"]).default("freeform"),
});

export const contentSlotStatusSchema = z.object({
  slotId: z.string().cuid(),
  status: z.nativeEnum(ContentSlotStatus),
});

export const contentSlotRescheduleSchema = z.object({
  slotId: z.string().cuid(),
  scheduledFor: z
    .union([z.string().datetime(), z.date()])
    .transform((value) => (value instanceof Date ? value : new Date(value))),
});

export const contentPublishHookSchema = z.object({
  slotId: z.string().cuid(),
  publishedAt: z
    .union([z.string().datetime(), z.date()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    }),
});

export const contentExportFilterSchema = z.object({
  planId: z.string().cuid().optional(),
  statuses: z.array(z.nativeEnum(ContentSlotStatus)).optional(),
  channels: z.array(z.nativeEnum(ContentChannel)).optional(),
  from: z.date().optional(),
  to: z.date().optional(),
});

export const monthlyAutopilotRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  timezone: z.string().min(1),
  channels: z.array(z.nativeEnum(ContentChannel)).min(1),
  volume: z.number().int().min(4).max(60).default(20).optional(),
  includeImages: z.boolean().default(true).optional(),
  // Simple “assistant brief” (natural language). This is the primary UX input.
  brief: z.string().max(4000).optional(),
  theme: z.string().optional(),
  themeBlocks: z
    .array(
      z.object({
        label: z.string().min(1),
        fromDay: z.number().int().min(1).max(31),
        toDay: z.number().int().min(1).max(31),
        theme: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .optional(),
  mix: z
    .object({
      education: z.number().int().min(0).max(100).optional(),
      authority: z.number().int().min(0).max(100).optional(),
      sales: z.number().int().min(0).max(100).optional(),
      community: z.number().int().min(0).max(100).optional(),
      trends: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
  promotions: z
    .array(
      z.object({
        name: z.string().min(1),
        kind: z.enum(["course_online", "course_in_person", "consultation", "product", "lead_magnet", "other"]),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
        frequency: z.number().int().min(0).max(20).optional(), // times per month
        notes: z.string().optional(),
      })
    )
    .optional(),
  tone: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  persona: z.string().optional(),
  campaign: z.string().optional(),
});

export type ContentExportFilters = z.infer<typeof contentExportFilterSchema>;
export type MonthlyAutopilotRequest = z.infer<typeof monthlyAutopilotRequestSchema>;