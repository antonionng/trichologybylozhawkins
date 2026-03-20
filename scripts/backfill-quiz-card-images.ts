/**
 * Assign default Unsplash card URLs to any published quiz missing both
 * `cardImageUrl` and `heroMediaId`. Does not delete or re-run full seed.
 *
 * Usage (from repo root):
 *   npx tsx scripts/backfill-quiz-card-images.ts
 *
 * Optional: limit to dry-run (no writes)
 *   DRY_RUN=1 npx tsx scripts/backfill-quiz-card-images.ts
 *
 * Optional: refresh all published quiz card URLs that do not use uploaded hero media
 *   REFRESH_ALL=1 npx tsx scripts/backfill-quiz-card-images.ts
 */
import { prisma } from "../src/server/db/client";
import { QuizStatus } from "@prisma/client";
import {
  QUIZ_CARD_IMAGE_POOL,
  resolveQuizCardImage,
} from "../src/lib/quizCardImagePool";

async function main() {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const refreshAll =
    process.env.REFRESH_ALL === "1" || process.env.REFRESH_ALL === "true";

  const missing = await prisma.quiz.findMany({
    where: {
      status: QuizStatus.PUBLISHED,
      heroMediaId: null,
      ...(refreshAll ? {} : { cardImageUrl: null }),
    },
    select: { id: true, title: true, slug: true, description: true },
    orderBy: { createdAt: "asc" },
  });

  if (missing.length === 0) {
    console.log(
      refreshAll
        ? "No quizzes available for refresh (all published rows use hero media or none matched)."
        : "No quizzes need card images (all published rows already have URL or hero)."
    );
    await prisma.$disconnect();
    return;
  }

  console.log(
    `${dryRun ? "[dry-run] Would update" : "Updating"} ${missing.length} quiz(es)${refreshAll ? " with refreshed artwork" : ""}…`,
  );

  for (let i = 0; i < missing.length; i++) {
    const row = missing[i]!;
    const url =
      resolveQuizCardImage({
        slug: row.slug,
        title: row.title,
        description: row.description,
      }) ?? QUIZ_CARD_IMAGE_POOL[i % QUIZ_CARD_IMAGE_POOL.length]!;
    const label = row.slug ? `"${row.title}" (${row.slug})` : `"${row.title}"`;
    if (dryRun) {
      console.log(`  - ${label} → ${url.slice(0, 60)}…`);
    } else {
      await prisma.quiz.update({
        where: { id: row.id },
        data: { cardImageUrl: url },
      });
      console.log(`  ✓ ${label}`);
    }
  }

  if (!dryRun) {
    console.log(`Done. Assigned ${missing.length} card image URL(s).`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
