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
  it("shows a single checkout path for guests", () => {
    setCartState();
    const html = renderToStaticMarkup(<CartPageClient />);

    expect(html).toContain("Continue to secure checkout");
    expect(html).toContain('placeholder="Email"');
    expect(html).toContain('placeholder="First name"');
    expect(html).toContain('placeholder="Last name"');
  });

  it("does not show auth-choice buttons for guests", () => {
    setCartState();
    const html = renderToStaticMarkup(<CartPageClient />);

    expect(html).not.toContain("Continue as guest");
    expect(html).not.toContain("Create account");
    expect(html).not.toContain("/login?next=%2Fshop%2Fcart");
  });

  it("shows inline missing-details fields for signed-in shoppers with incomplete identity", () => {
    setCartState();
    const html = renderToStaticMarkup(
      <CartPageClient
        initialCheckout={{
          isAuthenticated: true,
          customer: {
            email: "ag@example.com",
            firstName: "",
            lastName: "",
          },
        }}
      />,
    );

    expect(html).toContain("Signed in");
    expect(html).toContain("ag@example.com");
    expect(html).toContain('placeholder="First name"');
    expect(html).toContain('placeholder="Last name"');
  });

  it("does not show the identity form for signed-in shoppers with complete identity", () => {
    setCartState();
    const html = renderToStaticMarkup(
      <CartPageClient
        initialCheckout={{
          isAuthenticated: true,
          customer: {
            email: "ag@example.com",
            firstName: "Ant",
            lastName: "Gray",
          },
        }}
      />,
    );

    expect(html).toContain("Signed in");
    expect(html).toContain("Ant");
    expect(html).toContain("Gray");
    expect(html).not.toContain('placeholder="Email"');
    expect(html).not.toContain('placeholder="First name"');
    expect(html).not.toContain('placeholder="Last name"');
  });
});
