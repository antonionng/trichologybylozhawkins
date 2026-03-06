# Cart Brand Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make cart drawer and cart page feel on-brand (minimal luxe), remove the floating bottom-right cart trigger, and add regression tests for the updated UI expectations.

**Architecture:** Keep existing cart state + checkout logic unchanged and perform presentational updates in the two UI components (`CartDrawer`, `CartPageClient`). Add lightweight component render tests in Vitest using server-side rendering with mocked hooks so we can verify behavior and class/copy regressions without adding a browser test stack.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Vitest.

---

### Task 1: Add failing UI regression tests

**Files:**
- Create: `tests/shop/cart-ui-branding.test.tsx`
- Test: `tests/shop/cart-ui-branding.test.tsx`

**Step 1: Write the failing test**
- Assert `CartDrawer` does **not** render the floating fixed button copy when closed.
- Assert drawer open state includes refreshed CTA copy.
- Assert `CartPageClient` output includes upgraded brand container/panel classes.

**Step 2: Run test to verify it fails**
- Run: `npm test -- tests/shop/cart-ui-branding.test.tsx`
- Expected: FAIL because current UI still has old copy/classes/floating trigger.

### Task 2: Implement drawer refresh + remove floating trigger

**Files:**
- Modify: `src/components/shop/CartDrawer.tsx`
- Test: `tests/shop/cart-ui-branding.test.tsx`

**Step 1: Write minimal implementation**
- Remove fixed bottom-right launcher button.
- Apply minimal-luxe class updates for header, line items, quantity controls, and footer CTA.
- Update CTA copy to match refreshed tone.

**Step 2: Run test to verify targeted expectations pass**
- Run: `npm test -- tests/shop/cart-ui-branding.test.tsx`
- Expected: PASS for drawer assertions.

### Task 3: Implement cart page refresh

**Files:**
- Modify: `src/components/shop/CartPageClient.tsx`
- Test: `tests/shop/cart-ui-branding.test.tsx`

**Step 1: Write minimal implementation**
- Update page/card/checkout panel visual hierarchy for minimal-luxe style.
- Keep form and checkout behavior unchanged.

**Step 2: Run test to verify pass**
- Run: `npm test -- tests/shop/cart-ui-branding.test.tsx`
- Expected: PASS for cart page assertions.

### Task 4: Verify project health

**Files:**
- Modify: none expected

**Step 1: Run lints for touched files**
- Run: `npm run lint`
- Expected: PASS or no new errors from modified files.

**Step 2: Optional focused tests**
- Run: `npm test -- tests/api/shop-products-route.test.ts`
- Expected: PASS (sanity check, unchanged area).
