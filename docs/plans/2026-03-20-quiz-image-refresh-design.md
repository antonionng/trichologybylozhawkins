# Quiz Image Refresh Design

**Goal**
Replace people-heavy and repetitive quiz card artwork with a more varied scalp-only image set.

## Scope
- Remove the current salon-group image from quiz card usage.
- Replace repeated clinical fallback artwork with a more varied scalp-focused set.
- Keep the existing quiz image resolver flow and only change the image catalog plus targeted title mappings.
- Re-backfill existing quiz rows so the live academy grid reflects the new art direction immediately.

## Approved Direction
- Use scalp, hair texture, and clinical scalp assessment imagery only.
- Avoid lifestyle or group photos entirely.
- Prioritise visible academy quiz cards so adjacent quizzes do not show the same image.

## Technical Approach
- Update `src/lib/quizCardImagePool.ts` with a refreshed catalog and more specific title mappings for the high-visibility assessment cards.
- Add regression tests that block the old salon-group image and assert distinct mappings for the main academy assessment titles.
- Re-run the quiz image backfill script so existing quiz rows receive the refreshed URLs.

## Verification Strategy
- Run the focused quiz image mapping test.
- Run the quiz hero resolution test.
- Run the backfill script, then a dry run to confirm no quizzes remain missing artwork.
- Check lints for the touched files.

## Non-Goals
- No card layout changes.
- No new upload flow or local asset pipeline.
- No changes to quiz hero precedence over admin-uploaded media.
