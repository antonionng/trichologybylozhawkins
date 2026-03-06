import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartPageClient } from "@/components/shop/CartPageClient";

const mockUsePathname = vi.fn();
const mockUseShopCart = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/shop/CartProvider", () => ({
  useShopCart: () => mockUseShopCart(),
}));

vi.mock("@/app/actions/shop", () => ({
  startShopCheckout: vi.fn(),
}));

function setCartState(overrides: Record<string, unknown> = {}) {
  mockUseShopCart.mockReturnValue({
    items: [],
    itemCount: 0,
    subtotal: 0,
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    ...overrides,
  });
}

describe("cart UI brand refresh", () => {
  it("does not render a floating bottom-right cart button when drawer is closed", () => {
    mockUsePathname.mockReturnValue("/shop");
    setCartState({ isOpen: false, itemCount: 1 });

    const html = renderToStaticMarkup(<CartDrawer />);

    expect(html).not.toContain("Cart (");
  });

  it("shows refreshed drawer CTA copy when open", () => {
    mockUsePathname.mockReturnValue("/shop");
    setCartState({
      isOpen: true,
      itemCount: 1,
      subtotal: 21,
      items: [{ productId: "p1", slug: "hydrating-conditioner", name: "Hydrating Conditioner", price: 21, quantity: 1 }],
    });

    const html = renderToStaticMarkup(<CartDrawer />);

    expect(html).toContain("Review full cart");
  });

  it("renders the branded cart page container treatment", () => {
    setCartState({
      items: [{ productId: "p1", slug: "hydrating-conditioner", name: "Hydrating Conditioner", price: 21, quantity: 1 }],
      subtotal: 21,
    });

    const html = renderToStaticMarkup(<CartPageClient />);

    expect(html).toContain("bg-brand-ivory/70");
    expect(html).toContain("tracking-[0.28em]");
  });
});
