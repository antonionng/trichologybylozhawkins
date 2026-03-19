# Cart Checkout Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the shop cart to one checkout path, fix the signed-in missing-details bug, and add regression coverage for the new flow.

**Architecture:** Keep the current Stripe checkout backend contract intact and simplify only the cart page state machine in `CartPageClient`. Replace guest/auth branching with a single primary checkout action that conditionally reveals a compact identity form when required fields are missing. Cover the regression with focused component render tests and keep the existing server action behavior intact.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest.

---

### Task 1: Add failing regression tests for simplified cart checkout

**Files:**
- Modify: `tests/shop/cart-checkout-flow.test.tsx`
- Test: `tests/shop/cart-checkout-flow.test.tsx`

**Step 1: Write the failing test**
- Replace expectations tied to `Continue as guest`, `Create account`, and sign-in branching.
- Add a test asserting the cart shows one primary checkout CTA for guests.
- Add a test asserting guests do not see auth choice buttons on first render.
- Add a test asserting signed-in users with incomplete identity render the inline missing-details fields.
- Add a test asserting signed-in users with complete identity do not render the inline missing-details fields.

**Step 2: Run test to verify it fails**
- Run: `npm test -- tests/shop/cart-checkout-flow.test.tsx`
- Expected: FAIL because the current cart still renders auth-choice UI and hides missing-details fields for incomplete signed-in shoppers.

### Task 2: Implement the simplified cart checkout UI and validation flow

**Files:**
- Modify: `src/components/shop/CartPageClient.tsx`
- Test: `tests/shop/cart-checkout-flow.test.tsx`

**Step 1: Write minimal implementation**
- Remove `guestStep`, signup form state, and account-creation branching from the cart page.
- Keep one primary CTA: `Continue to secure checkout`.
- Compute whether the checkout identity is complete from `email`, `firstName`, and `lastName`.
- Show signed-in summary when authenticated.
- Reveal the inline identity form when:
  - the user is a guest, or
  - the user is signed in but missing one or more required fields.
- On checkout click:
  - if cart empty, keep the existing empty-cart error
  - if required identity is incomplete, show the inline form and a specific validation message
  - otherwise continue to `startShopCheckout()`

**Step 2: Run test to verify targeted expectations pass**
- Run: `npm test -- tests/shop/cart-checkout-flow.test.tsx`
- Expected: PASS

### Task 3: Verify the server-side checkout contract still matches the simplified flow

**Files:**
- Modify: none expected
- Test: `tests/actions/shop-checkout-start.test.ts`
- Test: `tests/schema/shop.checkout-lite.test.ts`

**Step 1: Run focused backend regression tests**
- Run: `npm test -- tests/actions/shop-checkout-start.test.ts tests/schema/shop.checkout-lite.test.ts`
- Expected: PASS to confirm logged-in hydration and Stripe checkout payload requirements are unchanged.

### Task 4: Verify project health for touched files

**Files:**
- Modify: none expected

**Step 1: Run lints on the touched file**
- Run: `npm run lint -- src/components/shop/CartPageClient.tsx`
- Expected: PASS or no new errors in the modified cart component.

**Step 2: Sanity-check combined flow tests**
- Run: `npm test -- tests/shop/cart-checkout-flow.test.tsx tests/actions/shop-checkout-start.test.ts`
- Expected: PASS
