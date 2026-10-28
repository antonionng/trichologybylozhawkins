import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkoutSessionSchema } from "@/server/schema/education";
import {
  DIGITAL_CONTENT_CONSENT_TEXT,
  requireDigitalContentConsent,
} from "@/lib/digitalContentConsent";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("digital content checkout consent", () => {
  it("requires an accepted consent timestamp", () => {
    expect(() => requireDigitalContentConsent()).toThrow(/agree to the Terms/);
    expect(
      requireDigitalContentConsent({
        accepted: true,
        acceptedAt: "2026-10-28T12:00:00.000Z",
      }),
    ).toEqual({
      digitalContentConsentAccepted: true,
      digitalContentConsentAcceptedAt: new Date("2026-10-28T12:00:00.000Z"),
    });
  });

  it("rejects Stripe checkout creation without consent", () => {
    expect(() =>
      checkoutSessionSchema.parse({
        productType: "COURSE",
        productId: "ckcourse12345678901234567",
        successUrl: "https://trichologyacademy.co.uk/education/success",
        cancelUrl: "https://trichologyacademy.co.uk/education",
      }),
    ).toThrow();

    expect(
      checkoutSessionSchema.parse({
        productType: "COURSE",
        productId: "ckcourse12345678901234567",
        successUrl: "https://trichologyacademy.co.uk/education/success",
        cancelUrl: "https://trichologyacademy.co.uk/education",
        digitalContentConsentAccepted: true,
        digitalContentConsentAcceptedAt: "2026-10-28T12:00:00.000Z",
      }),
    ).toMatchObject({
      digitalContentConsentAccepted: true,
    });
  });

  it("keeps the required checkbox and Stripe terms collection in the checkout path", () => {
    const purchaseButton = readRepoFile("src/components/education/PurchaseButton.tsx");
    const checkoutPage = readRepoFile("src/app/education/checkout/[slug]/page.tsx");
    const educationService = readRepoFile("src/server/modules/education/service.ts");
    const termsPage = readRepoFile("src/app/terms/page.tsx");

    expect(purchaseButton).toContain("DigitalContentConsent");
    expect(purchaseButton).toContain("acceptedAt");
    expect(checkoutPage).toContain("14-day cancellation right is lost once access starts");
    expect(educationService).toContain("consent_collection");
    expect(educationService).toContain('terms_of_service: "required"');
    expect(educationService).toContain("digitalContentConsentAccepted");
    expect(termsPage).toContain("Online courses and digital content");
    expect(termsPage).not.toContain("<strong>Video Courses:</strong>");
    expect(DIGITAL_CONTENT_CONSENT_TEXT).toContain("14-day cancellation right");
  });
});
