# Featured Lead Image Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure the featured lead promo always shows a real image behind the play button by falling back to Lorraine's hero image when the active lead has no own hero media.

**Architecture:** Keep the featured lead resolver and page wiring unchanged. Only update the two promo components so they compute a single media source from either the lead image or the existing hero fallback, then render the play button above that image.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, existing `photography` asset config

---

### Task 1: Add Regression Test

**Files:**
- Modify: `tests/education/featured-lead-promo-sections.test.ts`
- Test: `tests/education/featured-lead-promo-sections.test.ts`

**Step 1: Write the failing test**

Add assertions that both promo components contain:
- `photography.hero.src`
- `src={lead.heroUrl ?? photography.hero.src}`

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/education/featured-lead-promo-sections.test.ts`

Expected: FAIL because the components still use the plain gradient fallback instead of the hero image fallback.

### Task 2: Implement Homepage Banner Fallback

**Files:**
- Modify: `src/components/sections/HomepageFreeVideoBanner.tsx`
- Test: `tests/education/featured-lead-promo-sections.test.ts`

**Step 1: Import fallback asset**

Add:

```ts
import { photography } from "@/lib/visualAssets";
```

**Step 2: Compute the media source**

Use:

```ts
const mediaSrc = lead.heroUrl ?? photography.hero.src;
const mediaAlt = lead.heroUrl ? lead.title : photography.hero.alt;
```

**Step 3: Replace the empty-state gradient**

Always render the image panel with:

```tsx
<Image src={mediaSrc} alt={mediaAlt} fill ... />
```

Then keep a dark overlay and centered play button above it.

**Step 4: Run test to verify partial progress**

Run: `npx vitest tests/education/featured-lead-promo-sections.test.ts`

Expected: still red until the education promo section is updated too.

### Task 3: Implement Education Promo Fallback

**Files:**
- Modify: `src/components/sections/FreeAcademyVideoPromoSection.tsx`
- Test: `tests/education/featured-lead-promo-sections.test.ts`

**Step 1: Import fallback asset**

Add:

```ts
import { photography } from "@/lib/visualAssets";
```

**Step 2: Compute the media source**

Use the same fallback pattern as the homepage banner.

**Step 3: Replace the empty-state gradient**

Always render the image with the overlay and centered play button above it.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/education/featured-lead-promo-sections.test.ts`

Expected: PASS

### Task 4: Verify

**Files:**
- Modify: `src/components/sections/HomepageFreeVideoBanner.tsx`
- Modify: `src/components/sections/FreeAcademyVideoPromoSection.tsx`
- Test: `tests/education/featured-lead-promo-sections.test.ts`

**Step 1: Run lints**

Run: `ReadLints` on the two component files.

**Step 2: Re-run focused test**

Run: `npx vitest tests/education/featured-lead-promo-sections.test.ts`

Expected: PASS with no failures.
