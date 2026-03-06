import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ShopProductForm } from "@/components/dashboard/shop/ShopProductForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("ShopProductForm wizard", () => {
  it("renders a wizard-first new product experience", () => {
    const html = renderToStaticMarkup(<ShopProductForm categories={[]} />);

    expect(html).toContain("Step 1 of 5");
    expect(html).toContain("Product concept");
    expect(html).toContain("Generate AI Draft");
  });
});
