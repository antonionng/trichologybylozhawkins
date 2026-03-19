import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShopOrderStatus } from "@prisma/client";

const sendShopOrderConfirmationEmailMock = vi.fn();
const sendShopAdminOrderNotificationEmailMock = vi.fn();

vi.mock("@/server/modules/email/transactional", () => ({
  sendShopOrderConfirmationEmail: sendShopOrderConfirmationEmailMock,
  sendShopAdminOrderNotificationEmail: sendShopAdminOrderNotificationEmailMock,
}));

const baseOrder = {
  id: "ord_123",
  email: "customer@example.com",
  firstName: "Jane",
  lastName: "Doe",
  status: ShopOrderStatus.CONFIRMED,
  subtotalAmount: 36,
  shippingAmount: 0,
  totalAmount: 36,
  currency: "GBP",
  trackingNumber: null,
  trackingUrl: null,
  items: [{ productName: "Big", quantity: 2, unitPrice: 18, currency: "GBP" }],
};

describe("sendShopOrderLifecycleEmails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendShopOrderConfirmationEmailMock.mockResolvedValue({ skipped: false, id: "email_1" });
    sendShopAdminOrderNotificationEmailMock.mockResolvedValue({ skipped: false, id: "email_2" });
  });

  it("sends customer confirmation and admin notification when an order is confirmed", async () => {
    const { sendShopOrderLifecycleEmails } = await import("@/server/modules/shop/notifications");

    await sendShopOrderLifecycleEmails({
      order: baseOrder,
      previousStatus: ShopOrderStatus.PENDING,
      appUrl: "https://example.com",
      adminRecipients: ["ops@example.com", "shop@example.com"],
    });

    expect(sendShopOrderConfirmationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        orderId: "ord_123",
      }),
    );
    expect(sendShopAdminOrderNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["ops@example.com", "shop@example.com"],
        statusLabel: "Order confirmed",
      }),
    );
  });

  it("sends only the admin notification when tracking is updated", async () => {
    const { sendShopOrderLifecycleEmails } = await import("@/server/modules/shop/notifications");

    await sendShopOrderLifecycleEmails({
      order: {
        ...baseOrder,
        status: ShopOrderStatus.SHIPPED,
        trackingUrl: "https://track.example.com/ord_123",
      },
      previousStatus: ShopOrderStatus.SHIPPED,
      previousTrackingUrl: null,
      appUrl: "https://example.com",
      adminRecipients: ["ops@example.com"],
    });

    expect(sendShopOrderConfirmationEmailMock).not.toHaveBeenCalled();
    expect(sendShopAdminOrderNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusLabel: "Tracking updated",
      }),
    );
  });

  it("does not throw when an email send fails", async () => {
    const { sendShopOrderLifecycleEmails } = await import("@/server/modules/shop/notifications");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendShopOrderConfirmationEmailMock.mockRejectedValueOnce(new Error("email down"));

    await expect(
      sendShopOrderLifecycleEmails({
        order: baseOrder,
        previousStatus: ShopOrderStatus.PENDING,
        appUrl: "https://example.com",
        adminRecipients: ["ops@example.com"],
      })
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
