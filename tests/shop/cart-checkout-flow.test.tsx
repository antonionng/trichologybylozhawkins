import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CartPageClient } from "@/components/shop/CartPageClient";

const mockUseShopCart = vi.fn();

vi.mock("@/components/shop/CartProvider", () => ({
  useShopCart: () => mockUseShopCart(),
}));

vi.mock("@/app/actions/shop", () => ({
  startShopCheckout: vi.fn(),
}));

function setCartState(overrides: Record<string, unknown> = {}) {
  mockUseShopCart.mockReturnValue({
    items: [{ productId: "p1", slug: "hydrating-conditioner", name: "Hydrating Conditioner", price: 21, quantity: 1 }],
    subtotal: 21,
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    ...overrides,
  });
}

describe("shop cart checkout flow", () => {
  it("shows guest checkout choices when shopper is not logged in", () => {
    setCartState();
    const html = renderToStaticMarkup(<CartPageClient />);

    expect(html).toContain("Continue as guest");
    expect(html).toContain("Create account");
    expect(html).toContain("/login?next=%2Fshop%2Fcart");
  });

  it("does not show full shipping address fields before guest checkout starts", () => {
    setCartState();
    const html = renderToStaticMarkup(<CartPageClient />);

    expect(html).not.toContain('placeholder="line1"');
    expect(html).not.toContain('placeholder="city"');
    expect(html).not.toContain('placeholder="postalCode"');
  });
});
