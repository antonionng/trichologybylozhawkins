# Treatment Styling Image Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create clean individual hero images for the Treatment Styling products and update the seeded shop catalog to use them.

**Architecture:** Derive new cropped PNG assets from the provided source screenshots, then point the shop catalog seed script at those new files so the existing upload and media assignment flow can refresh the product hero images. Keep the storefront UI untouched and use the existing category-driven rendering path.

**Tech Stack:** TypeScript, Prisma, Supabase storage, local PNG assets, shop seed script

---

### Task 1: Create cropped product hero assets

**Files:**
- Create: `assets/treatment-styling-hair-density-hero.png`
- Create: `assets/treatment-styling-re-build-hero.png`
- Create: `assets/treatment-styling-silk-smooth-hero.png`
- Create: `assets/treatment-styling-big-hero.png`
- Create: `assets/treatment-styling-primer-hero.png`

**Step 1: Inspect the source screenshots**

Review the existing source files:
- `assets/image-0d2e12ef-7441-4299-be04-c7b48cadb3ff.png`
- `assets/WhatsApp_Image_2026-03-16_at_09.56.54__1_-10dfc532-5e6a-4525-8e73-dca6bb450c87.png`
- `assets/WhatsApp_Image_2026-03-16_at_10.18.53-596a6bd4-153d-4f6f-b00d-8a98df5b6e57.png`

**Step 2: Generate the individual crops**

Create one clean crop per product, favoring the product packaging and leaving enough whitespace for the existing card aspect ratio. Avoid brochure copy and duplicated second-product content in the final crop.

**Step 3: Verify the output assets exist**

Confirm all five cropped image files are present and usable before touching the import script.

### Task 2: Update the shop image mapping

**Files:**
- Modify: `scripts/seed-shop-catalog.ts`

**Step 1: Update `IMAGE_MAP`**

Replace the shared Treatment Styling image references with per-product hero files.

**Step 2: Update product image keys**

Point each of these products to its own image key:
- `hair-density-complex-treatment-styling`
- `rebuild-treatment-styling`
- `silk-smooth-treatment-styling`
- `big-treatment-styling`
- `primer-treatment-styling`

**Step 3: Keep the change narrow**

Do not change pricing, copy, category assignments, or unrelated shop products.

### Task 3: Refresh seeded media

**Files:**
- Verify via command: `scripts/seed-shop-catalog.ts`

**Step 1: Run the shop seed with env loaded**

Run:
```bash
node --env-file=.env --env-file=.env.local ./node_modules/tsx/dist/cli.mjs scripts/seed-shop-catalog.ts
```

Expected:
- Exit code `0`
- The script re-uploads the updated hero assets and refreshes the linked product media.

### Task 4: Verify the final storefront state

**Files:**
- Verify: `scripts/seed-shop-catalog.ts`

**Step 1: Run focused lint**

Run:
```bash
npx eslint scripts/seed-shop-catalog.ts
```

Expected:
- Exit code `0`

**Step 2: Verify database records still exist**

Query the database for `treatment-styling` products and confirm the same five published products remain.

**Step 3: Verify the local shop page**

Fetch the local `Treatment Styling` category page and confirm all five product names render successfully after the media refresh.
