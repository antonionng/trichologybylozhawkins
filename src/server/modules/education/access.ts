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

  return { user, contactId: user.contactId };
};

export const listAccessibleCourses = async (input: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, contactId: true },
  });
  if (!user) throw new Error("Unauthorized");

  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { heroMedia: true, pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });
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

  return prisma.videoProduct.findMany({
    where: { status: "PUBLISHED" },
    include: { heroMedia: true, pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });
};



