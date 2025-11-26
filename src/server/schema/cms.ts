import { CollectionType, EntryStatus } from "@prisma/client";
import { z } from "zod";

export const collectionUpsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug can contain lowercase letters, numbers, and hyphens."),
  type: z.nativeEnum(CollectionType).default(CollectionType.DOCUMENT),
});

export const entryContentSchema = z.record(z.any());

export const entryUpsertSchema = z.object({
  collectionId: z.string().cuid(),
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be URL friendly"),
  summary: z.string().optional(),
  content: entryContentSchema,
  meta: z
    .object({
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.nativeEnum(EntryStatus).default(EntryStatus.DRAFT),
  publishedAt: z.coerce.date().optional(),
  authorId: z.string().optional(),
  mediaIds: z.array(z.string().cuid()).default([]),
});

export const mediaAssetSchema = z.object({
  path: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  title: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const entryVersionCreateSchema = z.object({
  entryId: z.string().cuid(),
  snapshot: entryContentSchema,
  authorId: z.string().optional(),
});

export type EntryUpsertInput = z.infer<typeof entryUpsertSchema>;
export type CollectionUpsertInput = z.infer<typeof collectionUpsertSchema>;

