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
  videoProductPriceSchema,
  videoProductUpsertSchema,
} from "@/server/schema";
import { EnrollmentStatus, PaymentEventType } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";
import { sendEducationPurchaseNotifications } from "@/server/modules/education/notifications";

const getVideoProductDelegate = () =>
  (prisma as any).videoProduct as
    | {
        findMany: Function;
        findUnique: Function;
        create: Function;
        update: Function;
        delete: Function;
      }
    | undefined;

const getVideoProductPriceDelegate = () =>
  (prisma as any).videoProductPrice as
    | {
        updateMany: Function;
        update: Function;
        create: Function;
      }
    | undefined;

const warnVideoProductsUnavailable = () => {
  // Next dev does not typecheck by default, so schema/client mismatches can show up only at runtime.
  console.warn(
    "[education] Prisma Client is missing VideoProduct models. " +
      "Run `npm --prefix trichology run prisma:generate` (or `npx prisma generate` in /trichology) and restart the dev server."
  );
};

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

const videoProductMutationSchema = videoProductUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

const videoPriceMutationSchema = videoProductPriceSchema.extend({
  id: z.string().cuid().optional(),
});

const stripeClient = () => {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Set DEV_SKIP_CHECKOUT=true to bypass checkout in development.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
};

const MAX_SLUG_RETRIES = 20;

function isSlugUniqueConstraintError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code?: string }).code === "P2002";
  }
  return false;
}

export const upsertCourse = async (input: z.infer<typeof courseMutationSchema>) => {
  const data = courseMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.course.update({
      where: { id },
      data: payload,
    });
  }

  let slug = payload.slug;
  for (let attempt = 0; attempt <= MAX_SLUG_RETRIES; attempt++) {
    try {
      return await prisma.course.create({
        data: { ...payload, slug },
      });
    } catch (err) {
      if (isSlugUniqueConstraintError(err) && attempt < MAX_SLUG_RETRIES) {
        slug = `${payload.slug}-${attempt + 2}`;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Could not generate a unique course slug. Please try a different title.");
};

export const upsertVideoProduct = async (
  input: z.infer<typeof videoProductMutationSchema>
) => {
  const data = videoProductMutationSchema.parse(input);
  const { id, ...payload } = data;
  const videoProduct = getVideoProductDelegate();
  if (!videoProduct) {
    warnVideoProductsUnavailable();
    throw new Error("Video products are not available yet. Please regenerate Prisma Client.");
  }

  if (id) {
    return videoProduct.update({
      where: { id },
      data: payload as any,
    });
  }

  return videoProduct.create({
    data: payload as any,
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

  let position = payload.position;
  if (typeof position !== "number") {
    const agg = await prisma.courseModule.aggregate({
      where: { courseId: payload.courseId },
      _max: { position: true },
    });
    position = (agg._max.position ?? -1) + 1;
  }

  return prisma.courseModule.create({
    data: {
      ...payload,
      position,
    },
  });
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

  let position = payload.position;
  if (typeof position !== "number") {
    const agg = await prisma.courseLesson.aggregate({
      where: { moduleId: payload.moduleId },
      _max: { position: true },
    });
    position = (agg._max.position ?? -1) + 1;
  }

  return prisma.courseLesson.create({
    data: {
      ...payload,
      position,
    },
  });
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

export const upsertVideoProductPrice = async (
  input: z.infer<typeof videoPriceMutationSchema>
) => {
  const data = videoPriceMutationSchema.parse(input);
  const { id, ...payload } = data;
  const videoPrice = getVideoProductPriceDelegate();
  if (!videoPrice) {
    warnVideoProductsUnavailable();
    throw new Error("Video products are not available yet. Please regenerate Prisma Client.");
  }

  if (payload.isPrimary) {
    await videoPrice.updateMany({
      where: { videoProductId: payload.videoProductId },
      data: { isPrimary: false },
    });
  }

  if (id) {
    return videoPrice.update({
      where: { id },
      data: payload,
    });
  }

  return videoPrice.create({ data: payload });
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

export const getEducationStats = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalCourses,
    publishedCourses,
    draftCourses,
    reviewCourses,
    activeEnrollments,
    enrollmentsLast30Days,
    enquiriesNew,
    upcomingSessionsCount,
    sessionsNeedingCapacityAttention,
    revenueAllTime,
    revenueLast30Days,
    topCourses,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count({ where: { status: "DRAFT" } }),
    prisma.course.count({ where: { status: "REVIEW" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.enrollment.count({
      where: { status: "ACTIVE", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.courseEnquiry.count({ where: { status: "NEW" } }),
    prisma.courseSession.count({
      where: {
        status: { in: ["UPCOMING", "IN_PROGRESS"] },
        startDate: { not: null },
      },
    }),
    prisma.courseSession.count({
      where: {
        status: { in: ["UPCOMING", "IN_PROGRESS"] },
        capacity: { not: null },
        startDate: { not: null },
        // heuristic: flag sessions that are >= 80% full
        seatsTaken: { gte: 1 },
      },
    }),
    prisma.orderItem.aggregate({
      where: { courseId: { not: null }, order: { status: "PAID" } },
      _sum: { unitAmount: true },
    }),
    prisma.orderItem.aggregate({
      where: {
        courseId: { not: null },
        order: { status: "PAID", createdAt: { gte: thirtyDaysAgo } },
      },
      _sum: { unitAmount: true },
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        enrollmentType: true,
        _count: { select: { enrollments: true, enquiries: true, sessions: true } },
      },
    }),
  ]);

  return {
    totals: {
      courses: totalCourses,
      coursesPublished: publishedCourses,
      coursesDraft: draftCourses,
      coursesInReview: reviewCourses,
      enrollmentsActive: activeEnrollments,
      enquiriesNew,
      sessionsUpcomingOrLive: upcomingSessionsCount,
    },
    last30Days: {
      enrollments: enrollmentsLast30Days,
      revenue: revenueLast30Days._sum.unitAmount ?? 0,
    },
    revenueAllTime: revenueAllTime._sum.unitAmount ?? 0,
    alerts: {
      sessionsNeedingCapacityAttention,
    },
    topCourses,
  };
};

export const getRecentEnrollments = async (limit = 5) => {
  return prisma.enrollment.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      contact: true,
      course: true,
    },
  });
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
      heroMedia: true,
      prerequisites: {
        orderBy: { order: "asc" },
        include: {
          requiredCourse: { select: { id: true, slug: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getVideoCatalog = async (slug?: string) => {
  const videoProduct = getVideoProductDelegate();
  if (!videoProduct) {
    warnVideoProductsUnavailable();
    return [];
  }

  return videoProduct.findMany({
    where: slug ? { slug } : { status: "PUBLISHED" },
    include: {
      pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      heroMedia: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminCourseCatalog = async () => {
  return prisma.course.findMany({
    where: { slug: { not: "academy-quizzes" } },
    include: {
      modules: { include: { lessons: true }, orderBy: { position: "asc" } },
      pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      sessions: { orderBy: { startDate: "asc" } },
      downloads: true,
      heroMedia: true,
      _count: {
        select: { enrollments: true, enquiries: true, sessions: true, modules: true, downloads: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminVideoCatalog = async () => {
  const videoProduct = getVideoProductDelegate();
  if (!videoProduct) {
    warnVideoProductsUnavailable();
    return [];
  }

  return videoProduct.findMany({
    include: {
      pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      heroMedia: true,
      _count: { select: { accesses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getCourse = async (id: string) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { position: "asc" },
      },
      pricing: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      sessions: {
        orderBy: { startDate: "asc" },
      },
      downloads: true,
      heroMedia: true,
      _count: {
        select: { enrollments: true },
      },
    },
  });
};

export const getVideoProduct = async (id: string) => {
  const videoProduct = getVideoProductDelegate();
  if (!videoProduct) {
    warnVideoProductsUnavailable();
    return null;
  }

  return videoProduct.findUnique({
    where: { id },
    include: {
      pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      heroMedia: true,
      _count: { select: { accesses: true } },
    },
  });
};

export const deleteCourse = async (id: string) => {
  return prisma.course.delete({
    where: { id },
  });
};

export const deleteVideoProduct = async (id: string) => {
  const videoProduct = getVideoProductDelegate();
  if (!videoProduct) {
    warnVideoProductsUnavailable();
    throw new Error("Video products are not available yet. Please regenerate Prisma Client.");
  }

  return videoProduct.delete({
    where: { id },
  });
};

export const deleteCourseModule = async (id: string) => {
  return prisma.courseModule.delete({
    where: { id },
  });
};

export const deleteCourseLesson = async (id: string) => {
  return prisma.courseLesson.delete({
    where: { id },
  });
};

export const createCheckoutSession = async (
  input: z.infer<typeof checkoutSessionSchema>
) => {
  const data = checkoutSessionSchema.parse(input);
  const env = getServerEnv();
  const client = stripeClient();

  const isCourse = data.productType === "COURSE";
  const isVideo = data.productType === "VIDEO";

  const course = isCourse
    ? await prisma.course.findUnique({
        where: { id: data.productId },
        include: { pricing: true },
      })
    : null;

  const videoProduct = isVideo
    ? await (async () => {
        const delegate = getVideoProductDelegate();
        if (!delegate) {
          warnVideoProductsUnavailable();
          return null;
        }
        return delegate.findUnique({
          where: { id: data.productId },
          include: { pricing: true },
        });
      })()
    : null;

  if (isCourse && !course) {
    throw new Error("Course not found.");
  }

  if (isVideo && !videoProduct) {
    throw new Error("Video not found.");
  }

  const pricing = isCourse ? course!.pricing : videoProduct!.pricing;
  const selectedPrice =
    pricing.find((item) => item.id === data.priceId) ??
    pricing.find((item) => item.isPrimary) ??
    pricing[0];

  if (!selectedPrice) {
    throw new Error("Price is not configured.");
  }

  const customerEmail = data.metadata?.userEmail;

  const session = await client.checkout.sessions.create({
    mode: selectedPrice.billingType === "ONE_TIME" ? "payment" : "subscription",
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [
      {
        price_data: {
          currency: selectedPrice.currency.toLowerCase(),
          unit_amount: Number(selectedPrice.amount) * 100,
          product_data: {
            name: isCourse ? course!.title : videoProduct!.title,
            description: (isCourse ? course!.subtitle : videoProduct!.subtitle) ?? "",
          },
          recurring:
            selectedPrice.billingType === "SUBSCRIPTION"
              ? {
                  interval: (selectedPrice.billingCycle ?? "MONTHLY").toLowerCase() as
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
      productType: data.productType,
      productId: data.productId,
      priceId: selectedPrice.id,
      ...data.metadata,
    },
  });

  await prisma.order.create({
    data: {
      contactId: data.contactId ?? (await ensureAnonymousContact(session.customer_details)).id,
      totalAmount: selectedPrice.amount,
      currency: selectedPrice.currency,
      status: "PENDING",
      paymentProvider: "STRIPE",
      providerSessionId: session.id,
      metadata: data.metadata,
      items: {
        create: [
          isCourse
            ? {
                courseId: course!.id,
                unitAmount: selectedPrice.amount,
                currency: selectedPrice.currency,
                priceId: selectedPrice.id,
              }
            : {
                videoProductId: videoProduct!.id,
                unitAmount: selectedPrice.amount,
                currency: selectedPrice.currency,
                videoPriceId: selectedPrice.id,
              },
        ],
      },
    },
  });

  return session;
};

// Bundle: Phase 1 + Trichology in Clinical Practice for £700
const BUNDLE_CONFIG: Record<
  string,
  { name: string; amount: number; currency: string; courseSlugs: string[] }
> = {
  "phase-1-clinical-practice": {
    name: "Hair & Scalp Foundation Phase 1 + Trichology in Clinical Practice",
    amount: 700,
    currency: "GBP",
    courseSlugs: ["trichocare-phase-1", "trichology-clinical-practice"],
  },
};

export const getBundleBySlug = async (slug: string) => {
  const config = BUNDLE_CONFIG[slug];
  if (!config) return null;
  const courses = await prisma.course.findMany({
    where: { slug: { in: config.courseSlugs }, status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
  });
  if (courses.length !== config.courseSlugs.length) return null;
  return {
    slug,
    name: config.name,
    amount: config.amount,
    currency: config.currency,
    courses: courses.sort(
      (a, b) =>
        config.courseSlugs.indexOf(a.slug) - config.courseSlugs.indexOf(b.slug)
    ),
  };
};

export const createBundleCheckoutSession = async (options: {
  bundleSlug: string;
  contactId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  const bundle = await getBundleBySlug(options.bundleSlug);
  if (!bundle) throw new Error("Bundle not found.");
  const env = getServerEnv();
  const client = stripeClient();

  const customerEmail = options.metadata?.userEmail;

  const session = await client.checkout.sessions.create({
    mode: "payment",
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [
      {
        price_data: {
          currency: bundle.currency.toLowerCase(),
          unit_amount: bundle.amount * 100,
          product_data: {
            name: bundle.name,
            description: `Bundle includes: ${bundle.courses.map((c) => c.title).join(" and ")}. Lifetime access to both courses.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      productType: "BUNDLE",
      bundleSlug: options.bundleSlug,
      ...options.metadata,
    },
  });

  const contactId =
    options.contactId ??
    (await ensureAnonymousContact(session.customer_details)).id;

  await prisma.order.create({
    data: {
      contactId,
      totalAmount: bundle.amount,
      currency: bundle.currency,
      status: "PENDING",
      paymentProvider: "STRIPE",
      providerSessionId: session.id,
      metadata: { bundleSlug: options.bundleSlug, ...options.metadata },
      items: {
        create: bundle.courses.map((c) => ({
          courseId: c.id,
          unitAmount: Math.round(bundle.amount / bundle.courses.length),
          currency: bundle.currency,
        })),
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
  const order = await prisma.order.findFirst({
    where: { providerSessionId: options.providerSessionId },
    include: {
      contact: true,
      items: {
        include: {
          course: { select: { title: true } },
          videoProduct: { select: { title: true } },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found during fulfillment.");
  }

  if (options.status === "succeeded" && order.status === "PAID") {
    return;
  }

  if (options.status === "failed" && order.status === "CANCELLED") {
    return;
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
        const existing = await prisma.enrollment.findFirst({
          where: { orderId: order.id, courseId: item.courseId },
          select: { id: true },
        });

        if (!existing) {
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

      if (item.videoProductId) {
        const existing = await prisma.videoAccess.findFirst({
          where: { orderId: order.id, videoProductId: item.videoProductId },
          select: { id: true },
        });

        if (!existing) {
          await prisma.videoAccess.create({
            data: {
              contactId: order.contactId,
              videoProductId: item.videoProductId,
              status: EnrollmentStatus.ACTIVE,
              orderId: order.id,
            },
          });
        }
      }
    }

    await sendEducationPurchaseNotifications({
      orderId: order.id,
      email: order.contact.email,
      firstName: order.contact.firstName,
      lastName: order.contact.lastName,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.course?.title ?? item.videoProduct?.title ?? "Education purchase",
        quantity: item.quantity,
        unitAmount: Number(item.unitAmount),
        currency: item.currency,
      })),
    });
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

  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    select: { title: true },
  });

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

  const enquiry = await prisma.$transaction(async (tx) => {
    const created = await tx.courseEnquiry.create({
      data: {
        ...data,
        consentToMarketing: data.consentToMarketing ?? false,
        contactId: contact.id,
      },
    });

    await tx.activity.create({
      data: {
        contactId: contact.id,
        dealId: created.dealId ?? undefined,
        type: "NOTE",
        subject: `Course enquiry • ${course?.title ?? "Lorraine Hawkins Program"}`,
        body:
          data.message ??
          `New enquiry submitted for ${course?.title ?? "Lorraine Hawkins program"}.`,
        activityAt: new Date(),
      },
    });

    await tx.task.create({
      data: {
        contactId: contact.id,
        dealId: created.dealId ?? undefined,
        title: `Follow up: ${course?.title ?? "Education enquiry"}`,
        description: `Enquiry from ${data.name} (${data.email}) via education site.`,
        priority: "HIGH",
        status: "PENDING",
      },
    });

    return created;
  });

  return enquiry;
};

