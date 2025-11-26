import {
  BillingCycle,
  BillingType,
  CourseLevel,
  CourseStatus,
  EnrollmentStatus,
  EnrollmentType,
  SessionStatus,
} from "@prisma/client";
import { z } from "zod";

export const courseUpsertSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase, numbers, and hyphens."),
  description: z.string().optional(),
  level: z.nativeEnum(CourseLevel).default(CourseLevel.GENERAL),
  category: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  heroMediaId: z.string().cuid().nullable().optional(),
  previewVideoUrl: z.string().url().optional(),
  enrollmentType: z.nativeEnum(EnrollmentType).default(EnrollmentType.ON_DEMAND),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  meta: z.record(z.any()).optional(),
});

export const courseModuleSchema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().min(0).default(0),
  content: z.record(z.any()).optional(),
});

export const courseLessonSchema = z.object({
  moduleId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().min(0).default(0),
  videoUrl: z.string().url().optional(),
  downloadableId: z.string().cuid().optional(),
  content: z.record(z.any()).optional(),
});

export const coursePriceSchema = z.object({
  courseId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  billingType: z.nativeEnum(BillingType).default(BillingType.ONE_TIME),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  isPrimary: z.boolean().default(false),
  priceExternalId: z.string().optional(),
});

export const courseSessionSchema = z.object({
  courseId: z.string().cuid(),
  cohortName: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  enrollmentWindowStart: z.coerce.date().optional(),
  enrollmentWindowEnd: z.coerce.date().optional(),
  status: z.nativeEnum(SessionStatus).default(SessionStatus.UPCOMING),
});

export const courseEnquirySchema = z.object({
  courseId: z.string().cuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  consentToMarketing: z.boolean().default(false),
});

export const checkoutSessionSchema = z.object({
  courseId: z.string().cuid(),
  priceId: z.string().cuid().optional(),
  contactId: z.string().cuid().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()).optional(),
});

export const enrollmentUpdateSchema = z.object({
  enrollmentId: z.string().cuid(),
  status: z.nativeEnum(EnrollmentStatus),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type CourseUpsertInput = z.infer<typeof courseUpsertSchema>;

