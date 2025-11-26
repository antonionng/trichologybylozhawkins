import { prisma } from "@/server/db/client";
import {
  activityLogSchema,
  bulkTaskUpdateSchema,
  contactQuerySchema,
  contactUpsertSchema,
  dealUpsertSchema,
  taskUpsertSchema,
} from "@/server/schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const contactMutationSchema = contactUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export type ContactMutationInput = z.infer<typeof contactMutationSchema>;

export const upsertContact = async (input: ContactMutationInput) => {
  const data = contactMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.contact.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.contact.upsert({
    where: { email: payload.email },
    create: payload,
    update: payload,
  });
};

export const listContacts = async (params: z.input<typeof contactQuerySchema>) => {
  const filters = contactQuerySchema.parse(params);
  const { page, pageSize, search, ...rest } = filters;

  const where: Prisma.ContactWhereInput = {
    ...(rest.lifecycleStage && { lifecycleStage: rest.lifecycleStage }),
    ...(rest.ownerId && { ownerId: rest.ownerId }),
    ...(rest.companyId && { companyId: rest.companyId }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: true,
        deals: { include: { stage: true } },
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
  };
};

const dealMutationSchema = dealUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertDeal = async (input: z.infer<typeof dealMutationSchema>) => {
  const data = dealMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.deal.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.deal.create({
    data: payload,
  });
};

export const logActivity = async (input: z.input<typeof activityLogSchema>) => {
  const data = activityLogSchema.parse(input);
  return prisma.activity.create({ data });
};

const taskMutationSchema = taskUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertTask = async (input: z.infer<typeof taskMutationSchema>) => {
  const data = taskMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.task.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.task.create({
    data: payload,
  });
};

export const bulkUpdateTasks = async (input: z.input<typeof bulkTaskUpdateSchema>) => {
  const data = bulkTaskUpdateSchema.parse(input);
  return prisma.task.updateMany({
    where: { id: { in: data.taskIds } },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.dueAt && { dueAt: data.dueAt }),
      ...(data.ownerId && { ownerId: data.ownerId }),
    },
  });
};

export const getPipelineBoard = async () => {
  return prisma.dealPipeline.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          deals: {
            include: {
              contact: true,
              company: true,
            },
          },
        },
      },
    },
  });
};

export const listRecentActivities = async (limit = 10) => {
  return prisma.activity.findMany({
    orderBy: { activityAt: "desc" },
    take: limit,
    include: {
      contact: true,
      deal: true,
    },
  });
};

