# Quiz Image Seeding Design

**Goal**
Ensure every relevant published quiz shows a topic-matched image card instead of the generic placeholder state after seeding or quiz image backfill.

## Scope
- Expand the quiz card image source of truth beyond the current small generic pool.
- Make standalone public quizzes keep topic-matched stock images.
- Give seeded course exams and module quizzes predictable relevant images where possible.
- Keep the existing fallback pool for any future unmapped quiz rows.

## Approved Direction
- Use stock image URLs in seed data so quiz cards render immediately after seeding.
- Map quizzes by stable identifiers first, preferring slug where available and normalized title matching for seeded exams without slugs.
- Preserve the existing hero media resolution order so admin-uploaded media still wins over seeded card URLs.

## Technical Approach
- Extend `src/lib/quizCardImagePool.ts` from a flat pool into a richer source-of-truth module that also exports a helper for resolving a relevant card image from quiz metadata.
- Update `prisma/seed.ts` so standalone quizzes, seeded exams, and any remaining published quizzes use the helper before falling back to the generic pool.
- Cover the mapping logic with focused Vitest tests so new quiz titles or slugs do not silently regress back to unrelated imagery.

## Verification Strategy
- Add a focused test file for quiz card image mapping.
- Run the focused mapping test.
- Run the existing quiz hero resolution test.
- Check lints for the touched files.

## Non-Goals
- No UI redesign of quiz cards.
- No replacement of admin-uploaded hero media workflow.
- No attempt to source or upload local image assets.
