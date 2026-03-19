# Treatment Styling Image Cleanup Design

**Goal**
Replace the shared brochure-style Treatment Styling screenshots used as hero images with clean, individual product crops so the shop cards look polished and product-focused.

## Scope
- Create separate cropped hero images for `Hair Density Complex`, `RE-Build`, `Silk Smooth`, `Big`, and `Primer`.
- Update the shop catalog import script to reference those cropped assets.
- Re-seed the shop catalog so each product gets its own hero image in storage and the database.
- Verify the local storefront still renders all five products with the updated hero assets.

## Approved Direction
- Use clean product-only crops for shop cards.
- Do not keep brochure copy or the larger page layout as part of the final hero images.
- Keep the existing storefront card layout and product catalog structure unchanged.

## Image Strategy
- `Hair Density Complex` will use a crop from its single-product source image.
- `RE-Build` and `Silk Smooth` will each get separate crops from the shared two-product source image.
- `Big` and `Primer` will each get separate crops from the shared two-product source image.
- Crops should favor the bottle or bottle-and-box product silhouette, with enough whitespace to look balanced in the current landscape card frame.

## Technical Approach
- Generate new local PNG assets derived from the provided source screenshots.
- Keep the import path in `scripts/seed-shop-catalog.ts` as the source of truth for shop hero media.
- Reuse the existing `seed:shop` process to upload the cropped images and update `heroMediaId` on the relevant products.

## Verification Strategy
- Confirm the updated import script is lint-clean.
- Re-run the shop seed with the correct environment loaded.
- Query the database to verify the five Treatment Styling products still exist and remain published.
- Fetch the local `Treatment Styling` category page and confirm all five product names render after the image refresh.

## Non-Goals
- No product copy, pricing, or category changes.
- No UI redesign of the product cards or product detail page.
- No product gallery work in this change.
