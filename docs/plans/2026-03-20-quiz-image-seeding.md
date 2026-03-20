# Quiz Image Seeding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure seeded and backfilled quizzes receive topic-matched stock artwork so published quiz cards do not render placeholder question-mark states.

**Architecture:** Keep quiz hero resolution unchanged so uploaded hero media still has priority. Extend the quiz image source-of-truth module with slug and title-based matching, then make the seed and fallback pass through that resolver before using the generic rotating pool.

**Tech Stack:** Next.js App Router, TypeScript, Prisma seed script, Vitest

---

### Task 1: Add Mapping Regression Tests

**Files:**
- Modify: `src/lib/quizCardImagePool.ts`
- Create: `tests/education/quiz-card-image-pool.test.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- known standalone quiz slugs to resolve to dedicated image URLs
- seeded exam titles like `Trichocare Phase 1 Exam - Days 1-4` to resolve to a relevant image instead of `null`
- unknown quizzes to return `null`

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/education/quiz-card-image-pool.test.ts`

Expected: FAIL because the resolver does not exist yet.

### Task 2: Implement Quiz Image Resolver

**Files:**
- Modify: `src/lib/quizCardImagePool.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Add dedicated image entries**

Expand the image catalog with topic buckets for:
- knowledge check
- anatomy and biology
- patterned loss
- telogen and shedding
- inflammation and scalp conditions
- traction and styling
- consultation and clinical practice
- nutrition
- product and scalp care

**Step 2: Add a resolver helper**

Implement a helper that accepts quiz metadata:

```ts
type QuizImageLookupInput = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
};
```

It should:
- prefer explicit slug matches
- fall back to normalized title keyword matches
- return `null` when no relevant mapping exists

**Step 3: Run test to verify it passes**

Run: `npx vitest tests/education/quiz-card-image-pool.test.ts`

Expected: PASS

### Task 3: Wire Resolver Into Seeding

**Files:**
- Modify: `prisma/seed.ts`
- Test: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Use the resolver for seeded exams and module quizzes**

Before creating or updating quizzes in the seed, resolve:

```ts
const cardImageUrl = resolveQuizCardImage({
  slug: quizSlug,
  title: quizTitle,
  description: quizDescription,
});
```

Use that value when present.

**Step 2: Update fallback assignment**

When backfilling remaining published quizzes in the seed, try the resolver first and only use the rotating pool if nothing matches.

**Step 3: Run focused tests**

Run:
- `npx vitest tests/education/quiz-card-image-pool.test.ts`
- `npx vitest tests/education/quiz-hero-resolve.test.ts`

Expected: PASS

### Task 4: Verify

**Files:**
- Modify: `src/lib/quizCardImagePool.ts`
- Modify: `prisma/seed.ts`
- Create: `tests/education/quiz-card-image-pool.test.ts`

**Step 1: Run lints**

Run: `ReadLints` on the touched files.

**Step 2: Re-run focused tests**

Run:
- `npx vitest tests/education/quiz-card-image-pool.test.ts`
- `npx vitest tests/education/quiz-hero-resolve.test.ts`

Expected: PASS with no failures.
