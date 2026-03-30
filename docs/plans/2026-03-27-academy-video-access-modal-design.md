# Academy Video Access Modal Design

**Goal**
Keep academy users inside the academy when exploring locked videos, while letting purchased videos open the actual member player immediately.

## Scope
- Change the academy `Videos` tab so purchased videos open the member player directly.
- Add an in-academy modal for unpurchased videos with summary details and a `Buy now` CTA.
- Stop using the academy video cards as a route back to the public marketing-style video page for locked videos.
- Preserve the existing public `/education/videos/[slug]` pages for marketing and SEO outside the academy.
- Cover the new academy routing and modal behavior with regression tests.

## Approved Direction
- Purchased academy video cards should link straight to `/academy/videos/[videoId]`.
- Unpurchased academy video cards should open a modal inside `/academy?tab=videos`.
- The modal should show hero image, title, subtitle or description, category, duration, price, and key learning outcomes or benefits where available.
- The modal should use the existing checkout flow for `Buy now`.
- The academy should remain the primary context for locked video discovery. The public detail page can still exist, but it should no longer be the main academy path.

## Technical Approach
- Enrich the academy video data in `src/app/academy/page.tsx` so each video card has the fields needed to populate a detail modal. This likely includes parsed `publicContent` fields such as `headline`, `intro`, `learningOutcomes`, and `benefits`, with safe fallback to existing `subtitle` and `description`.
- Update `src/components/academy/AcademyTabs.tsx` to:
  - keep purchased `myVideos` cards as direct links to `/academy/videos/${video.id}`
  - replace unpurchased `browseVideos` links with buttons that open a local client-side modal
  - render a reusable modal state for the currently selected locked video
- Reuse the existing `VideoPurchaseButton` component inside the modal so checkout stays on the established path through `/education/videos/checkout/[slug]`.
- Keep `src/app/academy/videos/[videoId]/page.tsx` as the actual player page for purchased content, without adding an extra modal step for paid users.

## UX Details
- Locked cards should still look like video cards, but their CTA should communicate exploration and purchase instead of playback. For example, `View details` or `Learn more`.
- Purchased cards should keep a direct action such as `View video`.
- The modal should feel like part of the academy, not like a public sales page. The content should be concise, practical, and focused on what the learner gets.
- The modal should include a clear close action and support returning to the same tab and scroll position naturally.

## Verification Strategy
- Update the existing source-based regression test that currently expects academy browse video cards to link to `/education/videos/${video.slug}`.
- Add assertions that:
  - purchased academy video cards link to `/academy/videos/${video.id}`
  - browse video cards use modal state instead of direct public page links
  - the modal includes `Buy now` behavior through `VideoPurchaseButton`
- Run the focused academy and public education regression tests.
- Run lints for the touched files.

## Non-Goals
- No redesign of the public `/education/videos/[slug]` marketing page.
- No change to the existing checkout or fulfillment pipeline.
- No change to the purchased member video page layout unless required by the new routing.
