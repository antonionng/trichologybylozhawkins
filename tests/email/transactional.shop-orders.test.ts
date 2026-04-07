import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

describe("shop order transactional emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.RESEND_FROM_EMAIL = "Lorraine Hawkins <no-reply@example.com>";
    sendMock.mockResolvedValue({ data: { id: "email_123" } });
  });

  it("sends a customer confirmation email with order summary content", async () => {
    const { sendShopOrderConfirmationEmail } = await import("@/server/modules/email/transactional");

    const result = await sendShopOrderConfirmationEmail({
      to: "customer@example.com",
      appUrl: "https://example.com",
      orderId: "ord_123",
      customerName: "Jane Doe",
      customerEmail: "customer@example.com",
      subtotalAmount: 36,
      shippingAmount: 0,
      totalAmount: 36,
      currency: "GBP",
      items: [{ productName: "Big", quantity: 2, unitPrice: 18, currency: "GBP" }],
    });

    expect(result).toEqual({ skipped: false, id: "email_123" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: expect.stringContaining("ord_123"),
        html: expect.stringMatching(/Trichology Academy[\s\S]*Big/),
        text: expect.stringMatching(
          /Lorraine Hawkins · Trichology Academy[\s\S]*Total: GBP 36\.00/,
        ),
      }),
    );
  });

  it("sends an admin notification email to multiple recipients", async () => {
    const { sendShopAdminOrderNotificationEmail } = await import("@/server/modules/email/transactional");

    await sendShopAdminOrderNotificationEmail({
      to: ["ops@example.com", "shop@example.com"],
      appUrl: "https://example.com",
      orderId: "ord_456",
      customerName: "Jane Doe",
      customerEmail: "customer@example.com",
      statusLabel: "Order shipped",
      subtotalAmount: 18,
      shippingAmount: 0,
      totalAmount: 18,
      currency: "GBP",
      trackingUrl: "https://track.example.com/ord_456",
      items: [{ productName: "Big", quantity: 1, unitPrice: 18, currency: "GBP" }],
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["ops@example.com", "shop@example.com"],
        subject: expect.stringContaining("Order shipped"),
        html: expect.stringMatching(/Trichology Academy[\s\S]*\/dashboard\/shop\/orders\/ord_456/),
        text: expect.stringMatching(
          /Lorraine Hawkins · Trichology Academy[\s\S]*Tracking: https:\/\/track\.example\.com\/ord_456/,
        ),
      }),
    );
  });

  it("skips sending when the resend api key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendShopOrderConfirmationEmail } = await import("@/server/modules/email/transactional");

    const result = await sendShopOrderConfirmationEmail({
      to: "customer@example.com",
      appUrl: "https://example.com",
      orderId: "ord_123",
      customerName: "Jane Doe",
      customerEmail: "customer@example.com",
      subtotalAmount: 36,
      shippingAmount: 0,
      totalAmount: 36,
      currency: "GBP",
      items: [{ productName: "Big", quantity: 2, unitPrice: 18, currency: "GBP" }],
    });

    expect(result).toEqual({ skipped: true, reason: "Missing RESEND_API_KEY" });
    expect(sendMock).not.toHaveBeenCalled();
  });
});
