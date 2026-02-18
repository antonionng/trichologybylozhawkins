import {
  AssetVariantStatus,
  ContentAssetType,
  ContentChannel,
  ContentSlotStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { ContentExportFilters } from "@/server/schema";

export type UpsertContentSlotInput = {
  id?: string;
  planId?: string;
  title: string;
  brief?: string | null;
  persona?: string | null;
  campaign?: string | null;
  channel?: ContentChannel;
  scheduledFor?: Date | null;
  publishWindowEnd?: Date | null;
  publishedAt?: Date | null;
  status?: ContentSlotStatus;
  priority?: number | null;
  metadata?: Prisma.InputJsonValue | null;
};

export async function upsertContentSlot(input: UpsertContentSlotInput) {
  const { id, ...data } = input;

  if (id) {
    return prisma.contentSlot.update({
      where: { id },
      data,
      include: {
        plan: true,
        assets: {
          include: {
            variants: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return prisma.contentSlot.create({
    data,
    include: {
      plan: true,
      assets: {
        include: {
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export type AttachGenerationToSlotInput = {
  slotId: string;
  generationId?: string;
  type: ContentAssetType;
  title?: string | null;
  summary?: string | null;
  prompt?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
  mediaUrl?: string | null;
};

export async function attachGenerationToSlot(input: AttachGenerationToSlotInput) {
  const { slotId, ...data } = input;
  return prisma.contentAsset.create({
    data: {
      slotId,
      ...data,
    },
    include: {
      variants: true,
    },
  });
}

export type UpsertAssetVariantInput = {
  assetId: string;
  platform?: ContentChannel;
  status?: AssetVariantStatus;
  headline?: string | null;
  copy?: string | null;
  cta?: string | null;
  // Stored as TEXT in DB; callers may provide an array (AI output) or a string (UI).
  hashtags?: string[] | string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  aspectRatio?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

const normalizeHashtagsToText = (value: string[] | string | null | undefined) => {
  if (value == null) return null;
  const tokens = Array.isArray(value)
    ? value
    : value
        .split(/[\s,]+/g)
        .map((t) => t.trim())
        .filter(Boolean);

  const normalized = tokens
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));

  return normalized.join(" ");
};

export async function upsertAssetVariant(input: UpsertAssetVariantInput) {
  const platform = input.platform ?? ContentChannel.GENERIC;
  const hashtags = normalizeHashtagsToText(input.hashtags);

  const existing = await prisma.assetVariant.findFirst({
    where: {
      assetId: input.assetId,
      platform,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return prisma.assetVariant.update({
      where: { id: existing.id },
      data: {
        status: input.status ?? existing.status,
        headline: input.headline ?? existing.headline,
        copy: input.copy ?? existing.copy,
        cta: input.cta ?? existing.cta,
        hashtags: hashtags ?? existing.hashtags,
        mediaUrl: input.mediaUrl ?? existing.mediaUrl,
        thumbnailUrl: input.thumbnailUrl ?? existing.thumbnailUrl,
        aspectRatio: input.aspectRatio ?? existing.aspectRatio,
        metadata: input.metadata ?? (existing.metadata as any),
      },
    });
  }

  return prisma.assetVariant.create({
    data: {
      assetId: input.assetId,
      platform,
      status: input.status ?? AssetVariantStatus.DRAFT,
      headline: input.headline ?? null,
      copy: input.copy ?? null,
      cta: input.cta ?? null,
      hashtags,
      mediaUrl: input.mediaUrl ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      aspectRatio: input.aspectRatio ?? null,
      metadata: input.metadata ?? null,
    },
  });
}

export async function updateContentSlotStatus(slotId: string, status: ContentSlotStatus) {
  return prisma.contentSlot.update({
    where: { id: slotId },
    data: { status },
    include: {
      plan: true,
      assets: {
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function rescheduleContentSlot(slotId: string, scheduledFor: Date) {
  return prisma.contentSlot.update({
    where: { id: slotId },
    data: { scheduledFor },
    include: {
      plan: true,
      assets: {
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function markSlotPublished(slotId: string, publishedAt: Date) {
  return prisma.contentSlot.update({
    where: { id: slotId },
    data: {
      publishedAt,
      status: ContentSlotStatus.PUBLISHED,
    },
    include: {
      plan: true,
      assets: {
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function listExportableContent(filters: ContentExportFilters) {
  const where: Prisma.ContentSlotWhereInput = {};

  if (filters.planId) {
    where.planId = filters.planId;
  }

  if (filters.statuses?.length) {
    where.status = { in: filters.statuses };
  }

  if (filters.channels?.length) {
    where.channel = { in: filters.channels };
  }

  if (filters.from || filters.to) {
    where.scheduledFor = {};
    if (filters.from) {
      (where.scheduledFor as Prisma.DateTimeFilter).gte = filters.from;
    }
    if (filters.to) {
      (where.scheduledFor as Prisma.DateTimeFilter).lte = filters.to;
    }
  }

  return prisma.contentSlot.findMany({
    where,
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    include: {
      plan: true,
      assets: {
        orderBy: { createdAt: "asc" },
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function updateSlotAndVariant(input: {
  slotId: string;
  title?: string;
  brief?: string | null;
  scheduledFor?: Date | null;
  status?: ContentSlotStatus;
  variantId?: string;
  variantPatch?: Pick<
    Prisma.AssetVariantUpdateInput,
    "headline" | "copy" | "cta" | "hashtags" | "status"
  >;
}) {
  const { slotId, variantId, variantPatch, ...slotPatch } = input;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(slotPatch).length) {
      await tx.contentSlot.update({
        where: { id: slotId },
        data: slotPatch,
      });
    }

    if (variantId && variantPatch && Object.keys(variantPatch).length) {
      await tx.assetVariant.update({
        where: { id: variantId },
        data: variantPatch,
      });
    }

    return tx.contentSlot.findUnique({
      where: { id: slotId },
      include: {
        plan: true,
        assets: {
          orderBy: { createdAt: "desc" },
          include: {
            variants: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
  });
}