# Cart Brand Refresh Design

**Goal**
Refresh the cart drawer and cart page to feel more premium and on-brand (minimal luxe), and remove the floating bottom-right cart trigger that conflicts with the AI chat widget on mobile.

## Scope
- Visual redesign of `CartDrawer` and `CartPageClient` only.
- Preserve all checkout/cart behavior and data flow.
- Remove the fixed bottom-right floating cart button.
- Keep cart access via existing header cart controls.

## Brand Direction (Approved)
- **Style:** Minimal luxe.
- **Palette:** `brand-ivory`, `brand-sand`, `brand-graphite`, `brand-salmon` accents.
- **UI treatment:** Softer borders, better hierarchy, more polished controls and CTA emphasis.

## UX Decisions
- Cart drawer keeps slide-over behavior, but styling is upgraded for clearer information hierarchy.
- Drawer footer CTA remains, but label and styling should feel more premium and consistent with brand voice.
- Cart page gets stronger two-column visual rhythm on desktop and cleaner card/panel styling.
- Floating cart launcher is removed entirely so it no longer gets hidden behind AI chat.

## Test Strategy
- Add component-level render tests (no browser runtime required) to verify:
  - Floating button is not rendered when drawer is closed.
  - Drawer CTA copy/style expectations for refreshed UI.
  - Cart page renders upgraded brand classes and CTA treatment.

## Non-Goals
- No checkout API changes.
- No cart state logic changes.
- No navigation IA changes beyond removing the floating trigger.
