# Quiz Image Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace people-heavy and repetitive quiz card images with a varied scalp-only set and apply the refresh to existing quiz rows.

**Architecture:** Keep the existing resolver and seed flow intact. Refresh the underlying quiz image catalog, add more specific title-level mappings for the visible academy assessments, then run the existing backfill script so live quiz rows pick up the new image URLs.

**Tech Stack:** TypeScript, Prisma seed script, backfill script, Vitest

---

### Task 1: Add Refresh Regression Tests

**Files:**
- Modify: `tests/education/quiz-card-image-pool.test.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `quizCardImages.knowledgeCheck` is no longer the old salon-group photo
- `Multi-Disciplinary Practice Assessment`
- `Complex Case Management Assessment`
- `Advanced Trichoscopy & Microscopy Assessment`

resolve to stable dedicated image entries rather than collapsing onto the same generic consultation image.

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/education/quiz-card-image-pool.test.ts`

Expected: FAIL because the current catalog still uses the salon-group photo and repeated consultation fallback.

### Task 2: Refresh the Quiz Image Catalog

**Files:**
- Modify: `src/lib/quizCardImagePool.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Replace the image constants**

Swap the current people-heavy and repeated URLs for scalp-only or hair-texture imagery.

**Step 2: Add title-specific mappings**

Break up the visible academy assessment titles so they map to different scalp-focused image entries instead of one shared fallback.

**Step 3: Run the focused test**

Run: `npx vitest tests/education/quiz-card-image-pool.test.ts`

Expected: PASS

### Task 3: Apply the Refresh to Existing Quizzes

**Files:**
- Modify: `scripts/backfill-quiz-card-images.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Reuse the existing backfill path**

Keep the script logic unchanged unless needed. Use the refreshed resolver outputs to overwrite current quiz card URLs.

**Step 2: Run backfill**

Run: `npx tsx scripts/backfill-quiz-card-images.ts`

Expected: quiz rows update to the new scalp-only URLs.

**Step 3: Run dry-run verification**

Run: `DRY_RUN=1 npx tsx scripts/backfill-quiz-card-images.ts`

Expected: no published quizzes remain missing artwork.

### Task 4: Verify

**Files:**
- Modify: `src/lib/quizCardImagePool.ts`
- Modify: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Re-run focused tests**

Run:
- `npx vitest tests/education/quiz-card-image-pool.test.ts`
- `npx vitest tests/education/quiz-hero-resolve.test.ts`

Expected: PASS

**Step 2: Run lints**

Run: `ReadLints` on the touched files.

Expected: no linter errors.
