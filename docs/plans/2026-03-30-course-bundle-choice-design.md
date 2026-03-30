# Course Bundle Choice Design

**Goal**
Fix the paid course purchase loop for signed-in learners and add a clear bundle choice for the two bundle-eligible courses before checkout starts.

## Scope
- Stop the signed-in course checkout route from redirecting back to the course overview.
- Add a bundle choice prompt on eligible public course pages when the learner clicks `Start Course`.
- Add the same bundle choice on the eligible single-course checkout page as a fallback for direct visits.
- Keep existing single-course checkout, bundle checkout, Stripe fulfillment, and academy access rules intact.
- Cover the new behavior with focused regression tests.

## Approved Direction
- For bundle-eligible courses, clicking `Start Course` should first ask whether the learner wants:
  - `Continue with this course`
  - `Upgrade to bundle`
- The prompt should appear on the public course page and on the single-course checkout page.
- Choosing the single course should continue into the normal course checkout flow.
- Choosing the bundle should route into the existing bundle checkout flow.
- Non-bundle courses should keep their current `Start Course` behavior.

## Technical Approach
- Introduce a small shared helper that describes the existing course-to-bundle relationship so the same eligibility logic can be reused on both pages.
- Replace the direct `Link` CTA on bundle-eligible public course pages with a client-side prompt component that offers the single-course and bundle paths.
- Update `src/app/education/checkout/[slug]/page.tsx` so:
  - signed-in learners stay on the checkout page instead of being redirected back to the course page
  - signed-in learners see a direct payment CTA
  - bundle-eligible checkouts also show the same single-course or bundle choice
- Reuse the existing `PurchaseButton` and `BundleCheckoutCta` components so checkout initiation stays inside the established server actions.

## UX Details
- The prompt should be lightweight and decision-focused, not a full sales page.
- The learner must always have a clear path to keep the single course they originally selected.
- The bundle choice should only appear for the known bundle pair:
  - `trichocare-phase-1`
  - `trichology-clinical-practice`
- Direct checkout links should not bypass the bundle choice for eligible courses.

## Verification Strategy
- Add a regression test for the course checkout page so signed-in learners see a payment CTA instead of being redirected away.
- Add a regression test for the bundle choice UI on eligible course pages and checkout pages.
- Run the focused education tests that cover the updated CTA and checkout behavior.
- Check lints for the touched files.

## Non-Goals
- No changes to Stripe session creation or webhook fulfillment behavior.
- No changes to bundle pricing or bundle composition.
- No redesign of the public course marketing content outside the CTA area.
