import "server-only";

import { prisma } from "@/server/db/client";

export const requireCourseAccess = async (input: { userId: string; courseId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role === "ADMIN") {
    return { user, contactId: user.contactId };
  }

  if (!user.contactId) {
    throw new Error("No linked learner profile");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { contactId: user.contactId, courseId: input.courseId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!enrollment) {
    throw new Error("No access to this course");
  }

  return { user, contactId: user.contactId };
};

export const requireVideoAccess = async (input: { userId: string; videoProductId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role === "ADMIN") {
    return { user, contactId: user.contactId };
  }

  if (!user.contactId) {
    throw new Error("No linked learner profile");
  }

  const access = await prisma.videoAccess.findFirst({
    where: { contactId: user.contactId, videoProductId: input.videoProductId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!access) {
    throw new Error("No access to this video");
  }

  return { user, contactId: user.contactId };
};

export const listAccessibleCourses = async (input: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (user.role === "ADMIN") {
    // Admin can see all published courses; ops can expand later.
    return prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { heroMedia: true, pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!user.contactId) {
    return [];
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { contactId: user.contactId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          heroMedia: true,
          pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => e.course);
};

/**
 * Returns only courses the user is genuinely enrolled in (via Enrollment records),
 * regardless of role. Used for the "My Library" tab in the academy.
 */
export const listEnrolledCourses = async (input: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (!user.contactId) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { contactId: user.contactId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          heroMedia: true,
          pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => e.course);
};

/**
 * Returns only videos the user has purchased (via VideoAccess records),
 * regardless of role. Used for the "My Videos" section in the academy.
 */
export const listPurchasedVideos = async (input: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (!user.contactId) return [];

  const accesses = await prisma.videoAccess.findMany({
    where: { contactId: user.contactId, status: "ACTIVE" },
    include: {
      videoProduct: {
        include: {
          heroMedia: true,
          pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return accesses.map((a) => a.videoProduct);
};

export const listAccessibleVideos = async (input: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (user.role === "ADMIN") {
    return prisma.videoProduct.findMany({
      where: { status: "PUBLISHED" },
      include: { heroMedia: true, pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!user.contactId) {
    return [];
  }

  const accesses = await prisma.videoAccess.findMany({
    where: { contactId: user.contactId, status: "ACTIVE" },
    include: {
      videoProduct: {
        include: {
          heroMedia: true,
          pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return accesses.map((a) => a.videoProduct);
};



