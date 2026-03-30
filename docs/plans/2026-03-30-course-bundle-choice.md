# Course Bundle Choice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the signed-in course purchase loop and add a clear single-course versus bundle choice for the two bundle-eligible courses on both the public course page and the single-course checkout page.

**Architecture:** Keep checkout initiation in the existing server actions, but move bundle selection into reusable UI that can be rendered on both the course page and the course checkout page. Use one shared bundle-eligibility helper so the public CTA and checkout fallback stay in sync and only affect the intended courses.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest

---

### Task 1: Lock the broken checkout and new bundle-choice behavior with failing tests

**Files:**
- Create: `tests/education/course-checkout-bundle-choice.test.tsx`
- Reference: `src/app/education/checkout/[slug]/page.tsx`
- Reference: `src/app/education/[slug]/page.tsx`
- Reference: `src/components/education/PurchaseButton.tsx`
- Reference: `src/components/education/BundleCheckoutCta.tsx`

**Step 1: Write the failing test**

Add focused source or render assertions that verify:
- signed-in learners are not redirected from `education/checkout/[slug]` back to `education/[slug]`
- signed-in learners can see a single-course payment CTA on the course checkout page
- bundle-eligible courses expose both `Continue with this course` and `Upgrade to bundle`
- non-bundle courses do not show the extra bundle choice

Example assertions:

```ts
expect(checkoutPage).not.toContain("redirect(`/education/${params.slug}`)");
expect(checkoutPage).toContain("PurchaseButton");
expect(checkoutPage).toContain("Continue with this course");
expect(checkoutPage).toContain("Upgrade to bundle");
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: `FAIL` because the signed-in checkout page still redirects away and the bundle choice UI does not exist yet.

**Step 3: Write minimal implementation**

Do not implement yet. Move to Task 2 after the failure is confirmed.

**Step 4: Re-run to confirm the failure reason**

Run again if needed: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: still `FAIL` only because the approved behavior is missing.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 2: Add a shared helper for bundle-eligible course mapping

**Files:**
- Create: `src/lib/educationBundles.ts`
- Test: `tests/education/course-checkout-bundle-choice.test.tsx`
- Reference: `src/app/education/[slug]/page.tsx`
- Reference: `src/app/education/checkout/[slug]/page.tsx`

**Step 1: Add a bundle metadata helper**

Create a helper that returns bundle information for the existing two-course pair. It should expose:
- whether a course slug is bundle-eligible
- the bundle checkout href
- the companion course label if needed for copy

Suggested shape:

```ts
export function getCourseBundleOffer(courseSlug: string) {
  if (courseSlug === "trichocare-phase-1") {
    return {
      bundleSlug: "phase-1-clinical-practice",
      bundleHref: "/education/checkout/bundle/phase-1-clinical-practice",
      companionTitle: "Trichology in Clinical Practice",
    };
  }

  if (courseSlug === "trichology-clinical-practice") {
    return {
      bundleSlug: "phase-1-clinical-practice",
      bundleHref: "/education/checkout/bundle/phase-1-clinical-practice",
      companionTitle: "Hair & Scalp Foundation Phase 1",
    };
  }

  return null;
}
```

**Step 2: Keep the helper tiny and static**

Do not fetch database data or add admin configurability. This task only centralizes the current hardcoded bundle relationship.

**Step 3: Re-run the focused test**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: still `FAIL`, but now only because the UI has not been updated to consume the helper.

**Step 4: Review helper call sites**

Confirm the helper can be imported by both server-rendered pages without adding client-only dependencies.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 3: Add reusable bundle choice UI for eligible single-course purchases

**Files:**
- Create: `src/components/education/CourseBundleChoice.tsx`
- Modify: `src/components/education/PurchaseButton.tsx`
- Reference: `src/components/education/BundleCheckoutCta.tsx`

**Step 1: Build a reusable decision component**

Create a client component that renders:
- a short prompt about the available bundle
- a button or link for `Continue with this course`
- a button or link for `Upgrade to bundle`

Props should include:
- `courseId`
- `priceId`
- `amount`
- `currency`
- `courseSlug`
- `bundleSlug`
- `bundleHref`
- optional display copy such as `companionTitle`

**Step 2: Reuse existing actions and buttons**

The single-course path should keep using `PurchaseButton` or the existing `startCheckout()` action.

The bundle path should keep using the existing `BundleCheckoutCta` behavior or route to the bundle checkout href.

Do not duplicate Stripe-start logic in the new component.

**Step 3: Keep copy concise**

Use practical copy, for example:
- heading: `Want the full bundle instead?`
- body: short sentence naming the companion course
- actions:
  - `Continue with this course`
  - `Upgrade to bundle`

**Step 4: Re-run the focused test**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: may still `FAIL` because the pages do not yet render the new component.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 4: Update the public course page CTA behavior

**Files:**
- Modify: `src/app/education/[slug]/page.tsx`
- Reference: `src/lib/educationBundles.ts`
- Reference: `src/components/education/CourseBundleChoice.tsx`

**Step 1: Detect bundle-eligible courses**

Inside the course page, call `getCourseBundleOffer(course.slug)` once and store the result.

**Step 2: Replace the direct `Start Course` CTA only when needed**

For non-bundle courses:
- keep the existing `Link` to `/education/checkout/${course.slug}`

For bundle-eligible courses:
- replace the direct CTA with the bundle-choice component or a trigger that opens it
- keep the single-course path pointing to the single-course checkout
- keep the bundle path pointing to the bundle checkout

Apply the same logic to both the desktop sidebar CTA and the mobile sticky CTA.

**Step 3: Keep the existing bundle promo card**

Do not remove the existing `Bundle and save` card further down the page unless it becomes redundant during review. This task adds a decision prompt, not a content rewrite.

**Step 4: Re-run the focused test**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: may still `FAIL` because the checkout page behavior is not yet fixed.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 5: Fix the signed-in course checkout page and add the fallback bundle choice

**Files:**
- Modify: `src/app/education/checkout/[slug]/page.tsx`
- Reference: `src/components/education/PurchaseButton.tsx`
- Reference: `src/components/education/CheckoutAuthClient.tsx`
- Reference: `src/components/education/CourseBundleChoice.tsx`
- Reference: `src/lib/educationBundles.ts`

**Step 1: Remove the signed-in redirect loop**

Delete the logic that redirects signed-in users from the course checkout page back to `/education/${params.slug}`.

**Step 2: Match the working video checkout pattern**

Render:
- `PurchaseButton` for signed-in users on normal single-course checkouts
- `CheckoutAuthClient` for signed-out users

This should mirror the working shape already used in `src/app/education/videos/checkout/[slug]/page.tsx`.

**Step 3: Add the bundle fallback on checkout**

When the course is bundle-eligible:
- signed-in users should see the bundle-choice UI with a working single-course payment path
- signed-out users can still authenticate first, then choose on the checkout page once they return

If the chosen implementation renders the choice before auth for guests, keep the single-course and bundle paths intact after auth. Do not regress guest checkout.

**Step 4: Re-run the focused test**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx`

Expected: `PASS`

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 6: Run focused regressions and lint checks

**Files:**
- Review: `src/lib/educationBundles.ts`
- Review: `src/components/education/CourseBundleChoice.tsx`
- Review: `src/app/education/[slug]/page.tsx`
- Review: `src/app/education/checkout/[slug]/page.tsx`
- Review: `tests/education/course-checkout-bundle-choice.test.tsx`

**Step 1: Run the targeted regression tests**

Run: `npm test -- tests/education/course-checkout-bundle-choice.test.tsx tests/education/video-purchase-button.test.tsx`

Expected: `PASS`

**Step 2: Run lints**

Run: `npm run lint`

Expected: no new lint errors in the modified files.

**Step 3: Perform a quick manual verification**

If the dev server is running, verify:
- a signed-in learner can reach single-course payment from `/education/checkout/[slug]`
- a bundle-eligible course page asks whether they want the bundle
- the checkout page still offers the same choice
- choosing the bundle reaches `/education/checkout/bundle/phase-1-clinical-practice`

**Step 4: Commit**

Do not create a commit unless the user explicitly asks for one.
