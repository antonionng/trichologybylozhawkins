import { prisma } from "@/server/db/client";

export type HomepageFeaturedPublicQuizRecord = {
  slug: string | null;
  title: string;
  description: string | null;
  heroMediaId: string | null;
  cardImageUrl: string | null;
};

export type PublicQuizRecord = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  courseId: string;
  heroMediaId: string | null;
  cardImageUrl: string | null;
};

function isMissingQuizHeroColumnError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Quiz.heroMediaId") || error.message.includes("Quiz.cardImageUrl");
}

async function withQuizHeroColumnFallback<TLegacy extends object, TResult extends TLegacy & { heroMediaId: string | null; cardImageUrl: string | null }>(
  queryWithMedia: () => Promise<TResult | null>,
  queryLegacy: () => Promise<TLegacy | null>,
): Promise<TResult | null> {
  try {
    return await queryWithMedia();
  } catch (error) {
    if (!isMissingQuizHeroColumnError(error)) {
      throw error;
    }

    const legacyRecord = await queryLegacy();
    if (!legacyRecord) {
      return null;
    }

    return {
      ...legacyRecord,
      heroMediaId: null,
      cardImageUrl: null,
    };
  }
}

export async function findHomepageFeaturedPublicQuizRecord(
  slug: string,
): Promise<HomepageFeaturedPublicQuizRecord | null> {
  return withQuizHeroColumnFallback(
    () =>
      prisma.quiz.findFirst({
        where: { slug, isPublic: true, status: "PUBLISHED" },
        select: {
          slug: true,
          title: true,
          description: true,
          heroMediaId: true,
          cardImageUrl: true,
        },
      }),
    () =>
      prisma.quiz.findFirst({
        where: { slug, isPublic: true, status: "PUBLISHED" },
        select: {
          slug: true,
          title: true,
          description: true,
        },
      }),
  );
}

export async function findPublicQuizRecord(slug: string): Promise<PublicQuizRecord | null> {
  return withQuizHeroColumnFallback(
    () =>
      prisma.quiz.findFirst({
        where: { slug, isPublic: true, status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          passingScore: true,
          timeLimit: true,
          courseId: true,
          heroMediaId: true,
          cardImageUrl: true,
        },
      }),
    () =>
      prisma.quiz.findFirst({
        where: { slug, isPublic: true, status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          passingScore: true,
          timeLimit: true,
          courseId: true,
        },
      }),
  );
}
