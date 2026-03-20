# Featured Lead Image Fallback Design

**Goal**
Ensure the featured lead promo always shows a real image behind the play button, even when the selected quiz or video does not have its own hero media.

## Scope
- Update the homepage featured lead banner to always render an image in the media panel.
- Update the education promo section to use the same fallback behavior.
- Use the existing Lorraine hero image as the default fallback when no lead-specific image is available.
- Keep the centered play button layered on top of the image.

## Approved Direction
- Use `photography.hero.src` as the default fallback image.
- Preserve any lead-specific image when one exists.
- Keep the current copy, CTA layout, and overall card structure unchanged.

## Technical Approach
- Import `photography` from `src/lib/visualAssets.ts` into both promo components.
- Replace the plain gradient fallback state with an image-based fallback using `lead.heroUrl ?? photography.hero.src`.
- Keep a dark overlay above the image so the play button remains readable and visually anchored.
- Render the play button in both lead states so the image panel looks consistent for quizzes and videos.

## Verification Strategy
- Add a regression test that checks both promo components reference `photography.hero.src`.
- Run the targeted promo section test file.
- Check lints for the touched component files.

## Non-Goals
- No new image assets.
- No copy changes.
- No changes to lead selection logic or CTA destinations.
