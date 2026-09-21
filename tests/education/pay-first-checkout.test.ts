import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractCheckoutCustomerEmail,
  isPendingGuestCheckoutContact,
  pendingGuestCheckoutEmail,
} from "@/server/modules/education/checkoutContact";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("pay-first education checkout", () => {
  it("does not render an account wall on video, course, or bundle checkout pages", () => {
    const videoCheckout = readRepoFile("src/app/education/videos/checkout/[slug]/page.tsx");
    const courseCheckout = readRepoFile("src/app/education/checkout/[slug]/page.tsx");
    const bundleCheckout = readRepoFile("src/app/education/checkout/bundle/[slug]/page.tsx");

    for (const source of [videoCheckout, courseCheckout, bundleCheckout]) {
      expect(source).not.toContain("CheckoutAuthClient");
      expect(source).not.toContain("Create an account or sign in to complete your purchase.");
      expect(source).toContain("Continue to secure Stripe checkout");
    }

    expect(videoCheckout).toContain("VideoPurchaseButton");
    expect(courseCheckout).toContain("PurchaseButton");
    expect(bundleCheckout).toContain("BundleCheckoutCta");
  });

  it("extracts the paid Stripe email from session or webhook payloads", () => {
    expect(
      extractCheckoutCustomerEmail({
        customer_details: { email: "Buyer@example.com" },
      }),
    ).toBe("buyer@example.com");

    expect(
      extractCheckoutCustomerEmail({
        type: "checkout.session.completed",
        data: { object: { customer_email: "guest@example.com" } },
      }),
    ).toBe("guest@example.com");
  });

  it("marks pending guest contacts from the checkout session id", () => {
    const email = pendingGuestCheckoutEmail("cs_live_abc123");
    expect(email).toBe("pending+cs_live_abc123@guest.trichologyacademy.local");
    expect(isPendingGuestCheckoutContact({ email, source: "checkout-guest" })).toBe(true);
    expect(isPendingGuestCheckoutContact({ email: "member@example.com", source: "checkout" })).toBe(false);
  });
});
