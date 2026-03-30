# Academy Video Access Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let purchased academy videos open the member player immediately, while locked academy videos open an in-page detail modal with a `Buy now` CTA instead of routing back to the public marketing page.

**Architecture:** Keep the actual playback experience on the existing member page at `src/app/academy/videos/[videoId]/page.tsx`, and move locked-video exploration into `src/components/academy/AcademyTabs.tsx` with client-side modal state. Enrich academy video data in `src/app/academy/page.tsx` so the modal can render useful details without depending on the public marketing route.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest

---

### Task 1: Lock the academy video routing behavior with failing tests

**Files:**
- Modify: `tests/education/public-education-links.test.ts`
- Modify: `tests/academy/academy-featured-free-video.test.ts`
- Reference: `src/components/academy/AcademyTabs.tsx`
- Reference: `src/app/academy/page.tsx`

**Step 1: Write the failing test**

Update the academy-facing assertions so they reflect the approved behavior:
- academy purchased video cards should point at `/academy/videos/${video.id}`
- academy browse video cards should no longer point at `/education/videos/${video.slug}`
- academy tabs should include modal state for a selected locked video
- the locked video UI should surface a `Buy now` path via `VideoPurchaseButton`

Example assertions to add or update:

```ts
expect(academyTabs).toContain("href={`/academy/videos/${video.id}`}");
expect(academyTabs).not.toContain("href={`/education/videos/${video.slug}`}");
expect(academyTabs).toContain("selectedLockedVideo");
expect(academyTabs).toContain("VideoPurchaseButton");
```

If needed, add a source assertion in the academy page test to confirm the enriched video data includes modal-friendly public content fields.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/education/public-education-links.test.ts tests/academy/academy-featured-free-video.test.ts`

Expected: `FAIL` because the academy still routes browse video cards to the public page and does not yet render the locked-video modal flow.

**Step 3: Write minimal implementation**

Do not implement yet. Move to Task 2 after the test fails for the expected reason.

**Step 4: Re-run to confirm the failure is about missing behavior**

Run again if needed: `npm test -- tests/education/public-education-links.test.ts tests/academy/academy-featured-free-video.test.ts`

Expected: still `FAIL` only because the approved academy video routing and modal behavior are not present yet.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 2: Enrich academy video data for modal rendering

**Files:**
- Modify: `src/app/academy/page.tsx`
- Reference: `src/app/education/videos/[slug]/page.tsx`

**Step 1: Add modal-friendly fields to the academy video shape**

Extend the `withVideoHeroUrls` mapping so each video passed into `AcademyTabs` includes:
- `priceLabel`
- `headline` if present in `publicContent`
- `intro` if present in `publicContent`
- `learningOutcomes` from `publicContent.learningOutcomes`
- `benefits` from `publicContent.benefits`

Use safe fallbacks when `publicContent` is empty:
- title remains `title`
- description remains `subtitle ?? description`
- arrays default to `[]`

**Step 2: Keep the existing purchased and browse splits intact**

Do not change `myVideos` and `browseVideos` ownership logic. Only enrich the objects so the client component has enough modal data.

**Step 3: Run the focused tests**

Run: `npm test -- tests/education/public-education-links.test.ts tests/academy/academy-featured-free-video.test.ts`

Expected: tests may still fail, but only because the academy tabs component has not yet been updated to use the new data and modal behavior.

**Step 4: Review the server component output**

Check the resulting object shape in code review and confirm it provides everything the modal will need without another server fetch.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 3: Implement locked-video modal behavior in academy tabs

**Files:**
- Modify: `src/components/academy/AcademyTabs.tsx`
- Reference: `src/components/education/VideoPurchaseButton.tsx`

**Step 1: Add client-side selected video state**

In `AcademyTabs`, add state for the currently selected locked video, for example:

```ts
const [selectedLockedVideo, setSelectedLockedVideo] = useState<VideoCard | null>(null);
```

Also add a close handler that resets the selection back to `null`.

**Step 2: Update the academy video card actions**

For `myVideos`:
- keep the CTA as a direct `Link`
- route to `/academy/videos/${video.id}`
- keep the label as `View video`

For `browseVideos`:
- replace the direct `Link` with a button
- open the modal with `setSelectedLockedVideo(video)`
- use a label such as `View details` or `Learn more`

Do not route browse videos to `/education/videos/${video.slug}` from the academy anymore.

**Step 3: Render the in-academy modal**

At the end of the videos tab section, render a modal when `selectedLockedVideo` is set. The modal should include:
- hero image if available
- category
- title
- subtitle or description
- duration
- `priceLabel`
- up to 3 learning outcomes, falling back to benefits if outcomes are empty
- `VideoPurchaseButton` using:
  - `videoProductId={selectedLockedVideo.id}`
  - the primary pricing values already carried in the card data
  - `checkoutHref={`/education/videos/checkout/${selectedLockedVideo.slug}`}`

The modal should also include a close button and a click-safe content wrapper so it behaves like a standard overlay.

**Step 4: Keep the modal academy-native**

Do not embed or iframe the public page. Keep styling and copy aligned with the academy panel style so the experience does not feel like a route back into the marketing site.

**Step 5: Run the focused tests**

Run: `npm test -- tests/education/public-education-links.test.ts tests/academy/academy-featured-free-video.test.ts`

Expected: `PASS`

### Task 4: Lint and regression-check the touched files

**Files:**
- Review: `src/app/academy/page.tsx`
- Review: `src/components/academy/AcademyTabs.tsx`
- Review: `tests/education/public-education-links.test.ts`
- Review: `tests/academy/academy-featured-free-video.test.ts`

**Step 1: Run lints**

Run: `npm run lint`

Expected: no new lint errors in the modified files.

**Step 2: Re-run the focused tests for a clean final pass**

Run: `npm test -- tests/education/public-education-links.test.ts tests/academy/academy-featured-free-video.test.ts`

Expected: `PASS` with no unexpected warnings.

**Step 3: Optional browser verification**

If a local dev server is already running, verify:
- clicking a purchased academy video opens the player page directly
- clicking a locked academy video opens the academy modal
- clicking `Buy now` takes the learner into the existing checkout flow

**Step 4: Commit**

Do not create a commit unless the user explicitly asks for one.
