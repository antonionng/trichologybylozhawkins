# Treatment Styling Catalog Design

**Goal**
Add five Saco Treatment Styling products to the shop as real catalog items, with the correct prices and imagery, so they appear under the existing `Treatment Styling` shop tab without changing the storefront UI.

## Scope
- Update the seeded catalog source in `prisma/seed.ts`.
- Update the shop import script in `scripts/seed-shop-catalog.ts`.
- Align any fallback catalog content that still references outdated Treatment Styling pricing.
- Reuse the current shop category and storefront rendering path.

## Approved Product List
- `Hair Density Complex` at `£40`
- `RE-Build` at `£28`
- `Silk Smooth` at `£25`
- `Big` at `£18`
- `Primer` at `£18`

## UX Decisions
- No change to the `Treatment Styling` tab UI.
- Products continue to render through the existing category filter and product grid.
- Existing Treatment Styling products with outdated pricing or copy should be updated rather than duplicated.
- New products should use the provided images so the category feels complete and visually consistent.

## Data Decisions
- Keep all five products in the existing `treatment-styling` category.
- Preserve the current shop model and checkout flow.
- Use seeded/imported catalog data as the source of truth, rather than adding one-off live database edits.
- Update the existing `Primer`, `Silk Smooth`, and `Rebuild` seed records to match the approved pricing and naming.
- Add new seed records for `Hair Density Complex` and `Big`.

## Verification Strategy
- Check the edited catalog files for consistency across seed data, import data, and fallback data.
- Run lints on the touched files to confirm no syntax or type issues were introduced.

## Non-Goals
- No redesign of the shop page or category tabs.
- No checkout, cart, or product page behavior changes.
- No admin workflow changes.
