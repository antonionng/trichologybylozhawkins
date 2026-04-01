import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const getOperationalAdminRecipientsMock = vi.fn();
const saveOperationalAdminRecipientsMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/modules/settings/notifications", () => ({
  getOperationalAdminRecipients: getOperationalAdminRecipientsMock,
  saveOperationalAdminRecipients: saveOperationalAdminRecipientsMock,
}));

describe("email settings route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the current shared admin recipients to admins", async () => {
    getOperationalAdminRecipientsMock.mockResolvedValueOnce([
      "ops@example.com",
      "team@example.com",
    ]);

    const { GET } = await import("@/app/api/email/settings/route");
    const response = await GET();

    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    await expect(response.json()).resolves.toEqual({
      adminNotificationEmails: ["ops@example.com", "team@example.com"],
    });
  });

  it("saves the shared admin recipients for admins", async () => {
    saveOperationalAdminRecipientsMock.mockResolvedValueOnce([
      "owner@example.com",
      "team@example.com",
    ]);

    const { POST } = await import("@/app/api/email/settings/route");
    const response = await POST(
      new Request("http://localhost/api/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotificationEmails: [
            "owner@example.com",
            "team@example.com",
          ],
        }),
      }),
    );

    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(saveOperationalAdminRecipientsMock).toHaveBeenCalledWith([
      "owner@example.com",
      "team@example.com",
    ]);
    await expect(response.json()).resolves.toEqual({
      adminNotificationEmails: ["owner@example.com", "team@example.com"],
    });
  });

  it("returns 403 when a non-admin tries to load the settings", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("Forbidden"));

    const { GET } = await import("@/app/api/email/settings/route");
    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Forbidden",
    });
  });
});
