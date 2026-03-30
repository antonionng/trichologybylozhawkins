# Production Video Access Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure paid video purchases appear in the academy for the purchasing user and stop showing repeat buy CTAs for owned videos.

**Architecture:** Reconcile `user.contactId` with the fulfilled order contact during education claim so academy access queries resolve the right `videoAccess` rows. Then make public video CTAs ownership-aware by checking active access for the signed-in user before rendering purchase buttons.

**Tech Stack:** Next.js App Router, Prisma, Vitest

---

### Task 1: Claim reconciliation

**Files:**
- Modify: `src/app/api/education/claim/route.ts`
- Test: `tests/api/education-claim-route.test.ts`

**Step 1: Write the failing test**
- Add a route test proving an already authenticated learner with a missing `contactId` is updated to `order.contactId` when claim succeeds.

**Step 2: Run test to verify it fails**
- Run: `npm test -- tests/api/education-claim-route.test.ts`
- Expected: FAIL because the route currently returns early without reconciling the user contact.

**Step 3: Write minimal implementation**
- Update the claim route to backfill `contactId` for:
- the current session user, when present
- the matched email user, when present but not linked correctly

**Step 4: Run test to verify it passes**
- Run: `npm test -- tests/api/education-claim-route.test.ts`
- Expected: PASS

### Task 2: Owned video CTA behavior

**Files:**
- Modify: `src/app/education/videos/page.tsx`
- Modify: `src/app/education/videos/[slug]/page.tsx`
- Test: `tests/education/owned-video-cta.test.ts`

**Step 1: Write the failing test**
- Add a focused regression test proving the public video UI checks ownership before rendering buy actions.

**Step 2: Run test to verify it fails**
- Run: `npm test -- tests/education/owned-video-cta.test.ts`
- Expected: FAIL because the current UI always renders the purchase CTA for DB-backed videos.

**Step 3: Write minimal implementation**
- Resolve the signed-in user's active video access and switch CTA output to a non-purchase path for owned videos.

**Step 4: Run test to verify it passes**
- Run: `npm test -- tests/education/owned-video-cta.test.ts`
- Expected: PASS

### Task 3: Verification

**Files:**
- Test: `tests/api/education-claim-route.test.ts`
- Test: `tests/education/owned-video-cta.test.ts`

**Step 1: Run targeted verification**
- Run: `npm test -- tests/api/education-claim-route.test.ts tests/education/owned-video-cta.test.ts`

**Step 2: Run relevant existing regression coverage**
- Run: `npm test -- tests/actions/education-video-checkout.test.ts tests/education/video-purchase-button.test.tsx`

**Step 3: Check lint diagnostics**
- Run Cursor lints on edited files and fix any new issues.
