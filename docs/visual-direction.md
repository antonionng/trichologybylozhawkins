# Visual Direction Refresh — November 2025

## Mood & Narrative
- **Tone:** Restorative luxury grounded in clinical expertise; balance spa-like warmth with precise science.
- **Color Balance:** Continue beige/ivory foundation, introduce deeper salmon/graphite accents at 20–30% coverage for depth.
- **Imagery:** Pair calm portraiture with close-up trichology diagnostics to communicate empathy + rigor.

## Texture Strategy
- `linen.svg` — use as low-opacity overlays (0.35–0.6) on hero backplates, CTA panels, and large cards.
- `veined-paper.svg` — reserve for storytelling sections (testimonials/blog) to suggest organic growth.
- Apply via `background-image` with `mix-blend-mode: multiply` or `overlay` depending on contrast.

## Illustration Usage
- `fern-silhouette.svg` — botanical metaphor for regenerative care; scale to 40–60% width, blur subtly, position behind photography.
- `strand-orbit.svg` — abstract follicle energy; use in education + analytics contexts with `mix-blend-mode: soft-light`.
- Motion: animate fades and slow parallax (duration ≥ 0.9s, ease `[0.25, 0.95, 0.45, 1]`), avoid large translations.

## Photography Guidelines
- Lighting: soft diffused, warm highlights, muted midtones.
- Composition: negative space for typography; favour portraits looking slightly off-camera to connote contemplation.
- Post-processing: apply `filter: saturate(0.9) contrast(1.05)` to maintain calm palette.

## Motion Principles
- Primary hero collage: multi-layer parallax (5–12px shift) responding to scroll once user engages.
- Section reveals: staggered fade/slide-up with delay `0.08–0.12s` increments, amplitude ≤ 24px.
- Respect `prefers-reduced-motion`: disable parallax and reduce animation duration to 0.

## Accessibility Considerations
- Maintain text contrast ≥ 4.5:1; when placing text on imagery, introduce `backdrop-blur` glass cards.
- Provide descriptive alt text (already captured in `photography` map).
- Ensure interactive elements retain focus rings (Tailwind tokens to update accordingly).

## Implementation Notes
- Track assets in `src/lib/visualAssets.ts`.
- Update base components to accept `backgroundImage`, `texture`, `illustrationLayer` props for flexible usage.
- Document final component variants in Storybook (future task) or design system notes once build completes.

