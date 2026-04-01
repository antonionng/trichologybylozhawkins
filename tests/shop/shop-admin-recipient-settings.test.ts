import { beforeEach, describe, expect, it, vi } from "vitest";

const getOperationalAdminRecipientsMock = vi.fn();

vi.mock("@/server/modules/settings/notifications", () => ({
  getOperationalAdminRecipients: getOperationalAdminRecipientsMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendShopAdminOrderNotificationEmail: vi.fn(),
  sendShopOrderConfirmationEmail: vi.fn(),
}));

describe("shop admin recipient settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads admin recipients from shared notification settings", async () => {
    getOperationalAdminRecipientsMock.mockResolvedValueOnce([
      "ops@example.com",
      "team@example.com",
    ]);

    const { getShopAdminNotifyEmails } = await import("@/server/modules/shop/notifications");

    await expect(getShopAdminNotifyEmails()).resolves.toEqual([
      "ops@example.com",
      "team@example.com",
    ]);
  });
});
