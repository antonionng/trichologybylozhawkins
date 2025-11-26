import { prisma } from "@/server/db/client";
import {
  checkoutSessionSchema,
  courseEnquirySchema,
  courseLessonSchema,
  courseModuleSchema,
  coursePriceSchema,
  courseSessionSchema,
  courseUpsertSchema,
  enrollmentUpdateSchema,
  getServerEnv,
} from "@/server/schema";
import { EnrollmentStatus, PaymentEventType } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";

const courseMutationSchema = courseUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

const moduleMutationSchema = courseModuleSchema.extend({
  id: z.string().cuid().optional(),
});

const lessonMutationSchema = courseLessonSchema.extend({
  id: z.string().cuid().optional(),
});

const priceMutationSchema = coursePriceSchema.extend({
  id: z.string().cuid().optional(),
});

const sessionMutationSchema = courseSessionSchema.extend({
  id: z.string().cuid().optional(),
});

const stripeClient = () => {
  const env = getServerEnv();
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
};

export const upsertCourse = async (input: z.infer<typeof courseMutationSchema>) => {
  const data = courseMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.course.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.course.create({
    data: payload,
  });
};

export const upsertCourseModule = async (
  input: z.infer<typeof moduleMutationSchema>
) => {
  const data = moduleMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.courseModule.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.courseModule.create({ data: payload });
};

export const upsertCourseLesson = async (
  input: z.infer<typeof lessonMutationSchema>
) => {
  const data = lessonMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.courseLesson.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.courseLesson.create({ data: payload });
};

export const upsertCoursePrice = async (
  input: z.infer<typeof priceMutationSchema>
) => {
  const data = priceMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (payload.isPrimary) {
    await prisma.coursePrice.updateMany({
      where: { courseId: payload.courseId },
      data: { isPrimary: false },
    });
  }

  if (id) {
    return prisma.coursePrice.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.coursePrice.create({ data: payload });
};

export const upsertCourseSession = async (
  input: z.infer<typeof sessionMutationSchema>
) => {
  const data = sessionMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.courseSession.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.courseSession.create({ data: payload });
};

export const getCourseCatalog = async (slug?: string) => {
  return prisma.course.findMany({
    where: slug ? { slug } : { status: "PUBLISHED" },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { position: "asc" },
      },
      pricing: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      sessions: {
        where: { status: { in: ["UPCOMING", "IN_PROGRESS"] } },
        orderBy: { startDate: "asc" },
      },
      downloads: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createCheckoutSession = async (
  input: z.infer<typeof checkoutSessionSchema>
) => {
  const data = checkoutSessionSchema.parse(input);
  const env = getServerEnv();
  const client = stripeClient();

  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    include: { pricing: true },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  const price =
    course.pricing.find((item) => item.id === data.priceId) ??
    course.pricing.find((item) => item.isPrimary) ??
    course.pricing[0];

  if (!price) {
    throw new Error("Course price is not configured.");
  }

  const session = await client.checkout.sessions.create({
    mode: price.billingType === "ONE_TIME" ? "payment" : "subscription",
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    line_items: [
      {
        price_data: {
          currency: price.currency.toLowerCase(),
          unit_amount: Number(price.amount) * 100,
          product_data: {
            name: course.title,
            description: course.subtitle ?? "",
          },
          recurring:
            price.billingType === "SUBSCRIPTION"
              ? {
                  interval: (price.billingCycle ?? "MONTHLY").toLowerCase() as
                    | "month"
                    | "year"
                    | "week",
                }
              : undefined,
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      priceId: price.id,
      ...data.metadata,
    },
  });

  await prisma.order.create({
    data: {
      contactId: data.contactId ?? (await ensureAnonymousContact(session.customer_details)).id,
      totalAmount: price.amount,
      currency: price.currency,
      status: "PENDING",
      paymentProvider: "STRIPE",
      providerSessionId: session.id,
      metadata: data.metadata,
      items: {
        create: [
          {
            courseId: course.id,
            unitAmount: price.amount,
            currency: price.currency,
            priceId: price.id,
          },
        ],
      },
    },
  });

  return session;
};

const ensureAnonymousContact = async (
  details: Stripe.Checkout.Session.CustomerDetails | null
) => {
  if (!details?.email) {
    throw new Error("Unable to determine customer email for checkout.");
  }

  const existing = await prisma.contact.findUnique({
    where: { email: details.email },
  });

  if (existing) {
    return existing;
  }

  return prisma.contact.create({
    data: {
      email: details.email,
      firstName: details.name?.split(" ")[0] ?? "Learner",
      lastName: details.name?.split(" ").slice(1).join(" ") || "Guest",
      source: "checkout",
    },
  });
};

export const handleCheckoutFulfillment = async (options: {
  providerSessionId: string;
  paymentIntentId?: string | null;
  status: "succeeded" | "failed";
  payload?: Record<string, unknown>;
}) => {
  const order = await prisma.order.findUnique({
    where: { providerSessionId: options.providerSessionId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found during fulfillment.");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: options.status === "succeeded" ? "PAID" : "CANCELLED",
      providerPaymentIntentId: options.paymentIntentId ?? undefined,
      payments: {
        create: {
          type:
            options.status === "succeeded"
              ? PaymentEventType.PAYMENT_SUCCEEDED
              : PaymentEventType.PAYMENT_FAILED,
          payload: options.payload ?? {},
        },
      },
    },
  });

  if (options.status === "succeeded") {
    for (const item of order.items) {
      if (item.courseId) {
        await prisma.enrollment.create({
          data: {
            contactId: order.contactId,
            courseId: item.courseId,
            status: EnrollmentStatus.ACTIVE,
            orderId: order.id,
          },
        });
      }
    }
  }
};

export const recordEnrollmentStatus = async (
  input: z.infer<typeof enrollmentUpdateSchema>
) => {
  const data = enrollmentUpdateSchema.parse(input);

  return prisma.enrollment.update({
    where: { id: data.enrollmentId },
    data: {
      status: data.status,
      expiresAt: data.expiresAt,
      notes: data.notes,
    },
  });
};

export const createCourseEnquiry = async (
  input: z.infer<typeof courseEnquirySchema>
) => {
  const data = courseEnquirySchema.parse(input);

  const contact = await prisma.contact.upsert({
    where: { email: data.email },
    update: {
      firstName: data.name.split(" ")[0] ?? data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      phone: data.phone,
      source: data.source ?? "education",
    },
    create: {
      email: data.email,
      firstName: data.name.split(" ")[0] ?? data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      phone: data.phone,
      source: data.source ?? "education",
    },
  });

  return prisma.courseEnquiry.create({
    data: {
      ...data,
      consentToMarketing: data.consentToMarketing ?? false,
      contactId: contact.id,
    },
  });
};

