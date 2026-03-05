import { shopCheckoutSchema, shopProductSchema } from "@/server/schema";

describe("Shop schema validation", () => {
  it("accepts a valid shop product payload", () => {
    expect(() =>
      shopProductSchema.parse({
        name: "Revitalize Shampoo",
        slug: "revitalize-shampoo",
        price: 19,
        currency: "GBP",
        stockQuantity: 50,
        status: "PUBLISHED",
      }),
    ).not.toThrow();
  });

  it("rejects invalid product slugs", () => {
    expect(() =>
      shopProductSchema.parse({
        name: "Invalid",
        slug: "Invalid Slug",
        price: 10,
      }),
    ).toThrow();
  });

  it("accepts a valid checkout payload", () => {
    expect(() =>
      shopCheckoutSchema.parse({
        items: [{ productId: "ck1234567890123456789012", quantity: 2 }],
        customer: {
          email: "buyer@example.com",
          firstName: "Buyer",
          lastName: "One",
        },
        shippingAddress: {
          line1: "1 Street",
          city: "London",
          postalCode: "SW1A 1AA",
          country: "GB",
        },
        successUrl: "https://example.com/shop/success",
        cancelUrl: "https://example.com/shop/cart",
      }),
    ).not.toThrow();
  });
});

