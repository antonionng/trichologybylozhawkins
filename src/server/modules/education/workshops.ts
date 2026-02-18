import { prisma } from "@/server/db/client";
import { workshopUpsertSchema } from "@/server/schema";
import { z } from "zod";

const workshopMutationSchema = workshopUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertWorkshop = async (
  input: z.infer<typeof workshopMutationSchema>
) => {
  const data = workshopMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.workshop.update({
      where: { id },
      data: payload as any,
    });
  }

  return prisma.workshop.create({
    data: payload as any,
  });
};

export const getWorkshop = async (id: string) => {
  return prisma.workshop.findUnique({
    where: { id },
    include: { heroMedia: true },
  });
};

export const getWorkshopBySlug = async (slug: string) => {
  return prisma.workshop.findUnique({
    where: { slug },
    include: { heroMedia: true },
  });
};

export const getWorkshopCatalog = async (slug?: string) => {
  return prisma.workshop.findMany({
    where: slug ? { slug } : { status: "PUBLISHED" },
    include: { heroMedia: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminWorkshopCatalog = async () => {
  return prisma.workshop.findMany({
    include: { heroMedia: true },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteWorkshop = async (id: string) => {
  return prisma.workshop.delete({
    where: { id },
  });
};
