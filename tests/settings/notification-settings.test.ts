import { beforeEach, describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();
const upsertMock = vi.fn();
const getServerEnvMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    notificationSettings: {
      findUnique: findUniqueMock,
      upsert: upsertMock,
    },
  },
}));

vi.mock("@/server/schema/env", () => ({
  getServerEnv: getServerEnvMock,
  parseEmailList: (value?: string) =>
    !value
      ? []
      : [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))],
}));

describe("notification settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerEnvMock.mockReturnValue({
      CHAT_ADMIN_NOTIFY_EMAIL: "chat@example.com",
      SHOP_ADMIN_NOTIFY_EMAILS: "ops@example.com,team@example.com",
    });
  });

  it("returns persisted admin recipients when settings exist", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "default",
      adminNotificationEmails: ["owner@example.com", "team@example.com"],
    });

    const { getOperationalAdminRecipients } = await import("@/server/modules/settings/notifications");

    await expect(getOperationalAdminRecipients()).resolves.toEqual([
      "owner@example.com",
      "team@example.com",
    ]);
  });

  it("falls back to env recipients only when the settings row does not exist", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const { getOperationalAdminRecipients } = await import("@/server/modules/settings/notifications");

    await expect(getOperationalAdminRecipients()).resolves.toEqual([
      "ops@example.com",
      "team@example.com",
      "chat@example.com",
    ]);
  });

  it("does not fall back to env when a saved settings row is intentionally empty", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "default",
      adminNotificationEmails: [],
    });

    const { getOperationalAdminRecipients } = await import("@/server/modules/settings/notifications");

    await expect(getOperationalAdminRecipients()).resolves.toEqual([]);
  });

  it("normalizes and persists the shared admin recipient list", async () => {
    upsertMock.mockResolvedValueOnce({
      id: "default",
      adminNotificationEmails: ["owner@example.com", "team@example.com"],
    });

    const { saveOperationalAdminRecipients } = await import("@/server/modules/settings/notifications");

    await expect(
      saveOperationalAdminRecipients([
        " Owner@example.com ",
        "team@example.com",
        "owner@example.com",
        "",
      ]),
    ).resolves.toEqual(["owner@example.com", "team@example.com"]);

    expect(upsertMock).toHaveBeenCalledWith({
      where: { id: "default" },
      update: {
        adminNotificationEmails: ["owner@example.com", "team@example.com"],
      },
      create: {
        id: "default",
        adminNotificationEmails: ["owner@example.com", "team@example.com"],
      },
    });
  });

  it("always includes Lorraine and Antonio on enquiry mail", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "default",
      adminNotificationEmails: ["info@trichologybylorrainehawkins.co.uk"],
    });

    const { getEnquiryAdminRecipients } = await import(
      "@/server/modules/settings/notifications"
    );

    await expect(getEnquiryAdminRecipients()).resolves.toEqual([
      "loz.hawkins95@gmail.com",
      "ag@experrt.com",
      "info@trichologybylorrainehawkins.co.uk",
    ]);
  });

  it("still emails both enquiry inboxes when operational settings are empty", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "default",
      adminNotificationEmails: [],
    });

    const { getEnquiryAdminRecipients } = await import(
      "@/server/modules/settings/notifications"
    );

    await expect(getEnquiryAdminRecipients()).resolves.toEqual([
      "loz.hawkins95@gmail.com",
      "ag@experrt.com",
    ]);
  });
});
