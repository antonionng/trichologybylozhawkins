"use server";

import {
  courseLessonSchema,
  courseModuleSchema,
  coursePriceSchema,
  courseSessionSchema,
  courseUpsertSchema,
  videoProductPriceSchema,
  videoProductUpsertSchema,
  workshopUpsertSchema,
} from "@/server/schema";
import * as educationService from "@/server/modules/education/service";
import * as workshopService from "@/server/modules/education/workshops";
import { prisma } from "@/server/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUserOrRedirect } from "@/server/security/auth";

// Schemas with ID for updates
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

export async function getCourses() {
  return educationService.getCourseCatalog();
}

export async function getAdminCourses() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/courses" });
  return educationService.getAdminCourseCatalog();
}

export async function getCourseBySlug(slug: string) {
  const courses = await educationService.getCourseCatalog(slug);
  return courses[0] ?? null;
}

export async function getVideos() {
  return educationService.getVideoCatalog();
}

export async function getPublicQuizzes() {
  return prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
      isPublic: true,
      slug: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      passingScore: true,
      course: { select: { title: true } },
      _count: { select: { questions: true } },
    },
  });
}

export async function getAdminVideos() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/videos" });
  return educationService.getAdminVideoCatalog();
}

export async function getVideoBySlug(slug: string) {
  const videos = await educationService.getVideoCatalog(slug);
  return videos[0] ?? null;
}

export async function getEducationStats() {
  return educationService.getEducationStats();
}

export async function getRecentEnrollments() {
  return educationService.getRecentEnrollments();
}

export async function getCourse(id: string) {
  return educationService.getCourse(id);
}

export async function getVideoProduct(id: string) {
  return educationService.getVideoProduct(id);
}

export async function upsertCourse(data: z.infer<typeof courseMutationSchema>) {
  const course = await educationService.upsertCourse(data);
  revalidatePath("/dashboard/education");
  revalidatePath(`/dashboard/education/courses/${course.id}`);
  revalidatePath("/education");
  return course;
}

export async function upsertVideoProduct(data: z.infer<typeof videoProductMutationSchema>) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/videos" });
  const video = await educationService.upsertVideoProduct(data as any);
  revalidatePath("/dashboard/education");
  revalidatePath("/dashboard/education/videos");
  revalidatePath(`/dashboard/education/videos/${video.id}`);
  revalidatePath("/education/videos");
  revalidatePath(`/education/videos/${video.slug}`);
  return video;
}

export async function deleteCourse(id: string) {
  await educationService.deleteCourse(id);
  revalidatePath("/dashboard/education");
  revalidatePath("/education");
  redirect("/dashboard/education");
}

export async function deleteVideoProduct(id: string) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/videos" });
  await educationService.deleteVideoProduct(id);
  revalidatePath("/dashboard/education");
  revalidatePath("/dashboard/education/videos");
  revalidatePath("/education/videos");
  redirect("/dashboard/education/videos");
}

export async function upsertModule(data: z.infer<typeof moduleMutationSchema>) {
  const courseModule = await educationService.upsertCourseModule(data);
  revalidatePath(`/dashboard/education/courses/${courseModule.courseId}`);
  return courseModule;
}

export async function deleteModule(id: string, courseId: string) {
  await educationService.deleteCourseModule(id);
  revalidatePath(`/dashboard/education/courses/${courseId}`);
}

export async function upsertLesson(data: z.infer<typeof lessonMutationSchema>) {
  const lesson = await educationService.upsertCourseLesson(data);
  // We need to find the courseId to revalidate, but lesson only has moduleId.
  // For now we can rely on client side cache invalidation or passed courseId if we want to be precise,
  // but revalidating the dashboard path is safer.
  // Ideally we'd fetch the module to get the courseId, but let's just assume the UI handles it or we revalidate broadly.
  // Actually, let's fetch the module to be safe if we needed courseId, but since we don't have it easily,
  // we'll just rely on the user being on the course page.
  // A better approach:
  const courseModule = await prisma.courseModule.findUnique({
    where: { id: lesson.moduleId },
    select: { courseId: true },
  });
  
  if (courseModule) {
    revalidatePath(`/dashboard/education/courses/${courseModule.courseId}`);
  }
  return lesson;
}

export async function deleteLesson(id: string, courseId: string) {
  await educationService.deleteCourseLesson(id);
  revalidatePath(`/dashboard/education/courses/${courseId}`);
}

export async function upsertPrice(data: z.infer<typeof priceMutationSchema>) {
  const price = await educationService.upsertCoursePrice(data);
  revalidatePath(`/dashboard/education/courses/${price.courseId}`);
  return price;
}

export async function upsertVideoPrice(data: z.infer<typeof videoPriceMutationSchema>) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/videos" });
  const price = await educationService.upsertVideoProductPrice(data as any);
  revalidatePath(`/dashboard/education/videos/${price.videoProductId}`);
  revalidatePath("/education/videos");
  return price;
}

export async function upsertSession(data: z.infer<typeof sessionMutationSchema>) {
  const session = await educationService.upsertCourseSession(data);
  revalidatePath(`/dashboard/education/courses/${session.courseId}`);
  return session;
}

export async function startCheckout(courseId: string, priceId?: string) {
  const course = await educationService.getCourse(courseId);
  if (!course) throw new Error("Course not found");

  const { getCurrentSession } = await import("@/server/security/auth");
  const userSession = await getCurrentSession();

  let contactId: string | undefined;
  let metadata: Record<string, string> | undefined;

  if (userSession) {
    const user = await prisma.user.findUnique({
      where: { id: userSession.uid },
      select: { id: true, email: true, contactId: true },
    });

    if (user) {
      metadata = { userId: user.id, userEmail: user.email };
      if (user.contactId) contactId = user.contactId;
    }
  }

  // Skip Stripe checkout when DEV_SKIP_CHECKOUT is set — creates enrollment directly
  if (process.env.DEV_SKIP_CHECKOUT === "true") {
    const userEmail = metadata?.userEmail ?? "test@dev.local";

    if (!contactId) {
      const contact = await prisma.contact.upsert({
        where: { email: userEmail },
        update: {},
        create: {
          email: userEmail,
          firstName: "Test",
          lastName: "User",
          source: "dev-bypass",
        },
      });
      contactId = contact.id;

      if (userSession) {
        await prisma.user.update({
          where: { id: userSession.uid },
          data: { contactId: contact.id },
        });
      }
    }

    const existing = await prisma.enrollment.findFirst({
      where: { contactId, courseId },
    });

    if (!existing) {
      await prisma.enrollment.create({
        data: {
          contactId,
          courseId,
          status: "ACTIVE",
          activatedAt: new Date(),
        },
      });
    }

    redirect(`/academy/${courseId}`);
  }

  const session = await educationService.createCheckoutSession({
    productType: "COURSE",
    productId: courseId,
    priceId,
    contactId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education`,
    metadata,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function startBundleCheckout(bundleSlug: string) {
  const bundle = await educationService.getBundleBySlug(bundleSlug);
  if (!bundle) throw new Error("Bundle not found");

  const { getCurrentSession } = await import("@/server/security/auth");
  const userSession = await getCurrentSession();

  let contactId: string | undefined;
  let metadata: Record<string, string> | undefined;

  if (userSession) {
    const user = await prisma.user.findUnique({
      where: { id: userSession.uid },
      select: { id: true, email: true, contactId: true },
    });

    if (user) {
      metadata = { userId: user.id, userEmail: user.email };
      if (user.contactId) contactId = user.contactId;
    }
  }

  if (!contactId) {
    throw new Error("Please sign in or create an account to purchase the bundle.");
  }

  if (process.env.DEV_SKIP_CHECKOUT === "true") {
    for (const course of bundle.courses) {
      const existing = await prisma.enrollment.findFirst({
        where: { contactId, courseId: course.id },
        select: { id: true },
      });
      if (!existing) {
        await prisma.enrollment.create({
          data: {
            contactId,
            courseId: course.id,
            status: "ACTIVE",
            activatedAt: new Date(),
          },
        });
      }
    }
    redirect(`/academy/${bundle.courses[0].id}`);
  }

  const session = await educationService.createBundleCheckoutSession({
    bundleSlug,
    contactId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education`,
    metadata,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function startVideoCheckout(videoProductId: string, priceId?: string) {
  const video = await prisma.videoProduct.findUnique({ where: { id: videoProductId } });
  if (!video) throw new Error("Video not found");

  const session = await educationService.createCheckoutSession({
    productType: "VIDEO",
    productId: videoProductId,
    priceId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/education/videos`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function enrollInVideo(videoProductId: string) {
  const { getCurrentSession } = await import("@/server/security/auth");
  const userSession = await getCurrentSession();
  if (!userSession) throw new Error("You must be logged in to enroll");

  const video = await prisma.videoProduct.findUnique({ where: { id: videoProductId } });
  if (!video) throw new Error("Video not found");

  const user = await prisma.user.findUnique({
    where: { id: userSession.uid },
    select: { id: true, email: true, contactId: true, role: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role === "ADMIN") {
    redirect(`/academy/videos/${videoProductId}`);
  }

  let contactId = user.contactId;

  if (!contactId) {
    const contact = await prisma.contact.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        firstName: "Learner",
        lastName: "",
        source: "direct-enroll",
      },
    });
    contactId = contact.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { contactId: contact.id },
    });
  }

  const existing = await prisma.videoAccess.findFirst({
    where: { contactId, videoProductId },
  });

  if (!existing) {
    await prisma.videoAccess.create({
      data: {
        contactId,
        videoProductId,
        status: "ACTIVE",
      },
    });
  }

  redirect(`/academy/videos/${videoProductId}`);
}

// ── Workshop actions ────────────────────────────────────────────────────────

const workshopMutationSchema = workshopUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export async function getWorkshops() {
  return workshopService.getWorkshopCatalog();
}

export async function getAdminWorkshops() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/workshops" });
  return workshopService.getAdminWorkshopCatalog();
}

export async function getWorkshopBySlug(slug: string) {
  return workshopService.getWorkshopBySlug(slug);
}

export async function getWorkshopById(id: string) {
  return workshopService.getWorkshop(id);
}

export async function upsertWorkshop(data: z.infer<typeof workshopMutationSchema>) {
  const workshop = await workshopService.upsertWorkshop(data);
  revalidatePath("/dashboard/education/workshops");
  revalidatePath(`/dashboard/education/workshops/${workshop.id}`);
  revalidatePath("/education/workshops");
  revalidatePath(`/education/workshops/${workshop.slug}`);
  revalidatePath("/education");
  return workshop;
}

export async function deleteWorkshop(id: string) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/workshops" });
  await workshopService.deleteWorkshop(id);
  revalidatePath("/dashboard/education/workshops");
  revalidatePath("/education/workshops");
  revalidatePath("/education");
  redirect("/dashboard/education/workshops");
}

export async function markLessonComplete(lessonId: string, courseId: string) {
  const { user } = await requireUserOrRedirect();
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, courseId, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  revalidatePath(`/academy/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/academy/${courseId}`);
  revalidatePath("/academy");
}

export async function recordVideoWatch(videoProductId: string) {
  const { user } = await requireUserOrRedirect();
  await prisma.videoWatch.upsert({
    where: {
      userId_videoProductId: { userId: user.id, videoProductId },
    },
    create: { userId: user.id, videoProductId },
    update: { watchedAt: new Date() },
  });
  revalidatePath("/academy");
}


