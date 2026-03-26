import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { VideoPurchaseButton } from "@/components/education/VideoPurchaseButton";

(globalThis as { React?: typeof React }).React = React;

vi.mock("@/app/actions/education", () => ({
  startVideoCheckout: vi.fn(),
}));

describe("VideoPurchaseButton", () => {
  it("renders a checkout link for guests when a checkout path is provided", () => {
    const html = renderToStaticMarkup(
      <VideoPurchaseButton
        videoProductId="ck1234567890123456789012"
        priceId="ckprice1234567890123456"
        amount={29}
        currency="GBP"
        checkoutHref="/education/videos/checkout/sensitive-scalps"
      />
    );

    expect(html).toContain('href="/education/videos/checkout/sensitive-scalps"');
    expect(html).toContain("Buy for £29");
  });

  it("renders an action button when checkout can start immediately", () => {
    const html = renderToStaticMarkup(
      <VideoPurchaseButton
        videoProductId="ck1234567890123456789012"
        priceId="ckprice1234567890123456"
        amount={29}
        currency="GBP"
      />
    );

    expect(html).toContain("<button");
    expect(html).toContain("Buy for £29");
  });
});
