import {
  ActivityOutcome,
  ActivityType,
  LifecycleStage,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { z } from "zod";

export const contactUpsertSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  companyId: z.string().cuid().optional(),
  source: z.string().trim().optional(),
  ownerId: z.string().trim().optional(),
  lifecycleStage: z.nativeEnum(LifecycleStage).optional(),
  notes: z.string().optional(),
});

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  lifecycleStage: z.nativeEnum(LifecycleStage).optional(),
  ownerId: z.string().optional(),
  companyId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const companyUpsertSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  domain: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().optional(),
});

export const pipelineStageSchema = z.object({
  name: z.string().min(1),
  probability: z.number().min(0).max(100).default(0),
  order: z.number().int().min(0),
});

export const dealUpsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z
    .number()
    .positive()
    .optional(),
  currency: z.string().length(3).default("USD"),
  expectedClose: z.coerce.date().optional(),
  stageId: z.string().cuid(),
  pipelineId: z.string().cuid(),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  ownerId: z.string().optional(),
});

export const activityLogSchema = z.object({
  type: z.nativeEnum(ActivityType),
  subject: z.string().min(1),
  body: z.string().optional(),
  outcome: z.nativeEnum(ActivityOutcome).optional(),
  activityAt: z.coerce.date().optional(),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
});

export const taskUpsertSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueAt: z.coerce.date().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NORMAL),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
  ownerId: z.string().optional(),
});

export const bulkTaskUpdateSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1),
  status: z.nativeEnum(TaskStatus).optional(),
  dueAt: z.coerce.date().optional(),
  ownerId: z.string().optional(),
});

export type ContactUpsertInput = z.infer<typeof contactUpsertSchema>;
export type DealUpsertInput = z.infer<typeof dealUpsertSchema>;
export type ActivityLogInput = z.infer<typeof activityLogSchema>;
export type TaskUpsertInput = z.infer<typeof taskUpsertSchema>;

