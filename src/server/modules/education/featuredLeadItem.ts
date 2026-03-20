import { prisma } from "@/server/db/client";

export type FeaturedLeadItem =
  | {
      kind: "QUIZ";
      id: string;
      slug: string;
      title: string;
      description?: string | null;
    }
  | {
      kind: "VIDEO";
      id: string;
      slug: string;
      title: string;
      subtitle?: string | null;
      description?: string | null;
      category?: string | null;
      durationMinutes?: number | null;
      heroMedia?: { path: string } | null;
    };

export async function getCurrentFeaturedLeadItem(): Promise<FeaturedLeadItem | null> {
  const featuredQuiz = await prisma.quiz.findFirst({
    where: {
      status: "PUBLISHED",
      isPublic: true,
      isFeaturedLead: true,
      slug: { not: null },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
    },
  });

  if (featuredQuiz?.slug) {
    return {
      kind: "QUIZ",
      id: featuredQuiz.id,
      slug: featuredQuiz.slug,
      title: featuredQuiz.title,
      description: featuredQuiz.description,
    };
  }

  const featuredVideo = await prisma.videoProduct.findFirst({
    where: {
      status: "PUBLISHED",
      isFreeOnSignup: true,
    },
    include: {
      heroMedia: {
        select: {
          path: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  if (!featuredVideo) {
    return null;
  }

  return {
    kind: "VIDEO",
    id: featuredVideo.id,
    slug: featuredVideo.slug,
    title: featuredVideo.title,
    subtitle: featuredVideo.subtitle,
    description: featuredVideo.description,
    category: featuredVideo.category,
    durationMinutes: featuredVideo.durationMinutes,
    heroMedia: featuredVideo.heroMedia?.path ? { path: featuredVideo.heroMedia.path } : null,
  };
}
