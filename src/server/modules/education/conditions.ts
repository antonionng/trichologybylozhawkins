import { prisma } from "@/server/db/client";
import { ConditionStatus } from "@prisma/client";
import { z } from "zod";

// Schemas
export const conditionCreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  whatIsIt: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  causes: z.array(z.string()).optional(),
  treatments: z.array(z.string()).optional(),
  keyFacts: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  relatedConditions: z.array(z.string()).optional(),
  status: z.nativeEnum(ConditionStatus).default(ConditionStatus.DRAFT),
});

export const conditionUpdateSchema = conditionCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// CRUD Operations
export async function getConditions(status?: ConditionStatus) {
  return prisma.conditionReference.findMany({
    where: status ? { status } : undefined,
    include: {
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCondition(id: string) {
  return prisma.conditionReference.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

export async function getConditionBySlug(slug: string) {
  return prisma.conditionReference.findUnique({
    where: { slug },
    include: {
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

export async function createCondition(input: z.infer<typeof conditionCreateSchema>) {
  const data = conditionCreateSchema.parse(input);
  return prisma.conditionReference.create({
    data: {
      slug: data.slug,
      name: data.name,
      category: data.category,
      description: data.description,
      whatIsIt: data.whatIsIt,
      symptoms: data.symptoms,
      causes: data.causes,
      treatments: data.treatments,
      keyFacts: data.keyFacts,
      imageUrl: data.imageUrl,
      relatedConditions: data.relatedConditions,
      status: data.status,
    },
  });
}

export async function updateCondition(input: z.infer<typeof conditionUpdateSchema>) {
  const { id, ...data } = conditionUpdateSchema.parse(input);
  return prisma.conditionReference.update({
    where: { id },
    data,
  });
}

export async function deleteCondition(id: string) {
  return prisma.conditionReference.delete({
    where: { id },
  });
}

export async function linkConditionToCourse(conditionId: string, courseId: string) {
  return prisma.courseCondition.create({
    data: {
      conditionId,
      courseId,
    },
  });
}

export async function unlinkConditionFromCourse(conditionId: string, courseId: string) {
  return prisma.courseCondition.deleteMany({
    where: {
      conditionId,
      courseId,
    },
  });
}

// Get conditions by category
export async function getConditionsByCategory() {
  const conditions = await prisma.conditionReference.findMany({
    where: { status: ConditionStatus.PUBLISHED },
    orderBy: { name: "asc" },
  });

  const grouped: Record<string, typeof conditions> = {};
  for (const condition of conditions) {
    const category = condition.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(condition);
  }

  return grouped;
}

