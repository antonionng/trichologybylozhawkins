import { describe, expect, it } from "vitest";
import { shopCheckoutSchema } from "@/server/schema";

describe("shop checkout schema", () => {
  it("allows Stripe checkout payload without shipping or billing addresses", () => {
    expect(() =>
      shopCheckoutSchema.parse({
        items: [{ productId: "ck1234567890123456789012", quantity: 1 }],
        customer: {
          email: "guest@example.com",
          firstName: "Guest",
          lastName: "Buyer",
        },
        successUrl: "https://example.com/shop/success",
        cancelUrl: "https://example.com/shop/cart",
      }),
    ).not.toThrow();
  });
});
