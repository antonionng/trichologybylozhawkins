import { prisma } from "@/server/db/client";
import {
  collectionUpsertSchema,
  entryUpsertSchema,
  mediaAssetSchema,
} from "@/server/schema";
import { EntryStatus, Prisma } from "@prisma/client";
import { z } from "zod";

const collectionMutationSchema = collectionUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertCollection = async (
  input: z.infer<typeof collectionMutationSchema>
) => {
  const data = collectionMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.collection.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.collection.create({ data: payload });
};

export const listCollections = async () => {
  return prisma.collection.findMany({
    orderBy: { name: "asc" },
  });
};

const entryMutationSchema = entryUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertEntry = async (input: z.infer<typeof entryMutationSchema>) => {
  const data = entryMutationSchema.parse(input);
  const { id, mediaIds, ...payload } = data;

  return prisma.$transaction(async (tx) => {
    const entry = id
      ? await tx.entry.update({
          where: { id },
          data: {
            ...payload,
            mediaLinks: {
              deleteMany: {},
              create: mediaIds.map((mediaId) => ({ mediaId })),
            },
          },
        })
      : await tx.entry.create({
          data: {
            ...payload,
            mediaLinks: {
              create: mediaIds.map((mediaId) => ({ mediaId })),
            },
          },
        });

    await tx.entryVersion.create({
      data: {
        entryId: entry.id,
        authorId: payload.authorId,
        version: await nextEntryVersion(tx, entry.id),
        snapshot: {
          ...payload,
          mediaIds,
        },
      },
    });

    return entry;
  });
};

const nextEntryVersion = async (
  tx: Prisma.TransactionClient,
  entryId: string
) => {
  const latest = await tx.entryVersion.findFirst({
    where: { entryId },
    orderBy: { version: "desc" },
  });

  return latest ? latest.version + 1 : 1;
};

export const publishEntry = async (entryId: string) => {
  return prisma.entry.update({
    where: { id: entryId },
    data: {
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
};

export const listEntries = async (collectionSlug?: string) => {
  return prisma.entry.findMany({
    where: collectionSlug ? { collection: { slug: collectionSlug } } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      collection: true,
      mediaLinks: {
        include: { media: true },
      },
    },
  });
};

export const registerMediaAsset = async (
  input: z.infer<typeof mediaAssetSchema>
) => {
  const data = mediaAssetSchema.parse(input);
  return prisma.mediaAsset.upsert({
    where: { path: data.path },
    update: data,
    create: data,
  });
};

