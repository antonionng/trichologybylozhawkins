# Cart Checkout Simplification Design

**Goal**
Simplify the shop cart purchase flow to a single primary checkout path, while fixing the signed-in validation bug that blocks checkout when a user is missing profile name fields.

## Scope
- Simplify `CartPageClient` checkout UX to one clear primary action.
- Preserve the existing Stripe-backed shop checkout backend contract.
- Fix the misleading `Please add your name and email before checkout.` state for signed-in users.
- Add regression tests for the simplified cart behavior.

## Root Cause
- `CartPageClient` marks signed-in users as checkout-ready visually, but `onCheckout()` still requires `email`, `firstName`, and `lastName`.
- For signed-in users with incomplete contact data, the component hides the identity form, so there is no way to supply missing fields before the validation error is shown.
- The current guest flow also adds unnecessary friction with `Sign in`, `Create account`, and `Continue as guest` branching before purchase intent is clear.

## Approved UX Direction
- Show one primary CTA: `Continue to secure checkout`.
- Remove the guest-mode chooser from the cart page.
- If the shopper already has the required checkout identity fields, continue directly to Stripe.
- If required fields are missing, reveal a compact inline form that asks only for the missing details.
- Keep the signed-in summary visible for authenticated users, but allow missing profile fields to be completed inline on the same card.
- Remove account creation from the cart flow. Shoppers can buy without creating an account.

## Data Flow
- Keep `startShopCheckout()` and `shopCheckoutSchema` requiring `email`, `firstName`, and `lastName` before creating the Stripe session.
- `CartPageClient` becomes responsible for detecting whether required checkout identity is complete.
- The checkout button first checks completeness:
  - Complete identity: call `startShopCheckout()`.
  - Incomplete identity: expand the inline form and show a specific validation message.
- The payload sent to the server remains unchanged apart from using the newly completed inline values when necessary.

## Error Handling
- Replace the generic warning with clearer field-specific guidance such as asking for first and last name when those are missing.
- Keep existing empty-cart and checkout-failed handling.
- Avoid showing contradictory UI states where a shopper appears ready but cannot proceed.

## Test Strategy
- Update the cart checkout flow render tests to reflect the new simplified UI.
- Add focused behavior tests for:
  - guests seeing one checkout CTA instead of multiple auth options
  - signed-in users with incomplete identity seeing inline missing fields
  - signed-in users with complete identity not seeing the inline identity form
- Add or extend action tests to preserve the existing backend hydration behavior for logged-in users.

## Non-Goals
- No Stripe session schema redesign.
- No account area or profile management changes.
- No shipping-rate or fulfillment changes.
