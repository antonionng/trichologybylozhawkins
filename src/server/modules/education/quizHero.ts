import "server-only";

import { createSignedDownloadUrl } from "@/server/storage/supabase";

export type QuizHeroFields = {
  heroMedia?: { path: string } | null;
  cardImageUrl?: string | null;
};

/**
 * Prefer Supabase hero; fall back to external card URL (e.g. seeded Unsplash).
 */
export async function resolveQuizCardImageUrl(
  quiz: QuizHeroFields,
  expiresInSeconds = 60 * 10
): Promise<string | null> {
  if (quiz.heroMedia?.path) {
    try {
      return await createSignedDownloadUrl(quiz.heroMedia.path, expiresInSeconds);
    } catch {
      /* use fallback */
    }
  }
  const external = quiz.cardImageUrl?.trim();
  return external || null;
}
