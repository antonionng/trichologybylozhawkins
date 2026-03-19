# Treatment Styling Catalog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the approved Saco Treatment Styling products and prices to the seeded shop catalog so the storefront can display them under the existing `Treatment Styling` category.

**Architecture:** Keep the current category-driven shop flow intact and update the catalog source files that already define shop categories, products, and importable media. Correct the existing Treatment Styling seed entries, add the two missing products, and align fallback data so the category remains consistent whether the shop is loaded from seeded data or fallback content.

**Tech Stack:** Next.js, TypeScript, Prisma, shop seed scripts, Supabase media upload script

---

### Task 1: Update Treatment Styling seed definitions

**Files:**
- Modify: `prisma/seed.ts`

**Step 1: Review the existing Treatment Styling product records**

Check the current entries in `prisma/seed.ts` for:
- `primer-treatment-styling`
- `silk-smooth-treatment-styling`
- `rebuild-treatment-styling`

Confirm where the new `Hair Density Complex` and `Big` entries should be inserted in the `shopProducts` array.

**Step 2: Write the minimal seed data changes**

Update the Treatment Styling entries in `prisma/seed.ts` so the `shopProducts` array contains:
- `hair-density-complex-treatment-styling`
- `re-build-treatment-styling`
- `silk-smooth-treatment-styling`
- `big-treatment-styling`
- `primer-treatment-styling`

Use the approved prices:
- `Hair Density Complex` `40`
- `RE-Build` `28`
- `Silk Smooth` `25`
- `Big` `18`
- `Primer` `18`

Also refresh the copy so each seeded product has a sensible `shortDescription`, `description`, and `perfectFor` value that matches the supplied screenshots.

**Step 3: Verify the seed file stays coherent**

Confirm the updated array still uses:
- `categorySlug: "treatment-styling"`
- `currency: "GBP"` through the existing create path
- existing SKU generation and published status behavior

### Task 2: Update the shop catalog import script and image mapping

**Files:**
- Modify: `scripts/seed-shop-catalog.ts`

**Step 1: Extend the available image asset map**

Add image mappings for the supplied Treatment Styling screenshots stored in the shared assets directory, including:
- Hair Density Complex
- RE-Build / Silk Smooth
- Big / Primer

Decide which product gets which image asset based on the screenshots. If one screenshot contains two products, use the shared image for both relevant product records unless a later split is necessary.

**Step 2: Add or update product entries in the import script**

Update the `products` array in `scripts/seed-shop-catalog.ts` to include all five approved Treatment Styling items with:
- the correct slugs
- approved names
- approved prices
- aligned descriptions
- correct `categorySlug`
- matching `imageKey`

Correct the existing `Primer`, `Silk Smooth`, and `Rebuild` records instead of leaving outdated versions in place.

**Step 3: Verify the media upload path still works**

Check that each Treatment Styling product entry points to a valid key in `IMAGE_MAP`, so `ensureMediaForProduct()` can continue uploading hero media without any extra script changes.

### Task 3: Align fallback catalog content

**Files:**
- Modify: `src/lib/content.ts`

**Step 1: Inspect existing Treatment Styling fallback entries**

Review `HOME_PRODUCT_FALLBACKS` and identify any outdated Treatment Styling prices or copy.

**Step 2: Make the minimal fallback update**

Update the fallback Treatment Styling entry so it no longer conflicts with the approved catalog pricing and naming. Keep the change narrow and only touch entries that are now inaccurate.

### Task 4: Verify edited files

**Files:**
- Verify: `prisma/seed.ts`
- Verify: `scripts/seed-shop-catalog.ts`
- Verify: `src/lib/content.ts`

**Step 1: Run a focused lint check**

Run:
```bash
npx eslint prisma/seed.ts scripts/seed-shop-catalog.ts src/lib/content.ts
```

Expected:
- Exit code `0`
- No parsing or lint errors introduced by the catalog update

**Step 2: Re-read the approved requirements**

Confirm the final data set includes:
- five Treatment Styling products
- the approved names and prices
- no duplicate old Treatment Styling entries left behind
- no storefront UI code changes

**Step 3: Report exact status**

Summarize what changed, note any limitations in the shared screenshots, and avoid any success claim unless the verification command output confirms the files are clean.
