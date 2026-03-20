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

const videoSourceTypeSchema = z.enum(["UPLOAD", "LINK"]).default("UPLOAD");

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
  // Sales & Marketing
  learningOutcomes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional().default([]),
});

export const courseModuleSchema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  content: z.record(z.any()).optional(),
});

export const courseLessonSchema = z.object({
  moduleId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  // Supports either a public URL or a Supabase storage path (used with signed URLs).
  videoUrl: z.string().min(1).optional(),
  downloadableId: z.string().cuid().optional(),
  content: z.record(z.any()).optional(),
});

export const coursePriceSchema = z.object({
  courseId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("GBP"),
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
  productType: z.enum(["COURSE", "VIDEO"]),
  productId: z.string().cuid(),
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

export const videoProductUpsertSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase, numbers, and hyphens."),
  description: z.string().optional(),
  category: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  isFreeOnSignup: z.boolean().optional(),
  heroMediaId: z.string().cuid().nullable().optional(),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  videoSourceType: videoSourceTypeSchema,
  videoPath: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  publicContent: z.record(z.any()).optional(),
  memberContent: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional(),
});

export const videoProductPriceSchema = z.object({
  videoProductId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("GBP"),
  billingType: z.nativeEnum(BillingType).default(BillingType.ONE_TIME),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  isPrimary: z.boolean().default(false),
  priceExternalId: z.string().optional(),
});

export const workshopUpsertSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase, numbers, and hyphens."),
  headline: z.string().optional(),
  summary: z.string().optional(),
  longDescription: z.string().optional(),
  duration: z.string().optional(),
  investment: z.string().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  heroMediaId: z.string().cuid().nullable().optional(),
  outcomes: z.array(z.string()).default([]),
  whoItsFor: z.array(z.string()).default([]),
  whatYouGet: z.array(z.string()).default([]),
  agenda: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .optional()
    .default([]),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional()
    .default([]),
  testimonials: z
    .array(
      z.object({ quote: z.string(), author: z.string(), role: z.string() })
    )
    .optional()
    .default([]),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export type CourseUpsertInput = z.infer<typeof courseUpsertSchema>;
export type WorkshopUpsertInput = z.infer<typeof workshopUpsertSchema>;

