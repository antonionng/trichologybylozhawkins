import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertContactMock = vi.fn();
const logActivityMock = vi.fn();
const upsertTaskMock = vi.fn();
const getEnquiryAdminRecipientsMock = vi.fn();
const sendEnquiryConfirmationEmailMock = vi.fn();
const sendAdminEnquiryNotificationEmailMock = vi.fn();

vi.mock("@/server/modules/crm/service", () => ({
  upsertContact: upsertContactMock,
  logActivity: logActivityMock,
  upsertTask: upsertTaskMock,
}));

vi.mock("@/server/modules/settings/notifications", () => ({
  getEnquiryAdminRecipients: getEnquiryAdminRecipientsMock,
}));

vi.mock("@/server/schema", () => ({
  getServerEnv: () => ({
    NEXT_PUBLIC_APP_URL: "https://example.com",
  }),
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendEnquiryConfirmationEmail: sendEnquiryConfirmationEmailMock,
  sendAdminEnquiryNotificationEmail: sendAdminEnquiryNotificationEmailMock,
}));

describe("crm enquiries route emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertContactMock.mockResolvedValue({
      id: "contact_1",
      email: "jane@example.com",
    });
    logActivityMock.mockResolvedValue(undefined);
    upsertTaskMock.mockResolvedValue(undefined);
    getEnquiryAdminRecipientsMock.mockResolvedValue([
      "loz.hawkins95@gmail.com",
      "ag@experrt.com",
      "ops@example.com",
    ]);
    sendEnquiryConfirmationEmailMock.mockResolvedValue({
      skipped: false,
      id: "msg_1",
    });
    sendAdminEnquiryNotificationEmailMock.mockResolvedValue({
      skipped: false,
      id: "msg_2",
    });
  });

  it("sends customer and admin emails for contact enquiries", async () => {
    const { POST } = await import("@/app/api/crm/enquiries/route");

    const response = await POST(
      new Request("http://localhost/api/crm/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryType: "education",
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          phone: "01234 567890",
          company: "Example Salon",
          jobTitle: "Owner",
          message: "I would like help choosing the right training.",
          preferredContactMethod: "email",
          urgency: "normal",
          consentToMarketing: true,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(sendEnquiryConfirmationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jane@example.com",
        firstName: "Jane",
        enquiryType: "education",
      }),
    );
    expect(getEnquiryAdminRecipientsMock).toHaveBeenCalledTimes(1);
    expect(sendAdminEnquiryNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["loz.hawkins95@gmail.com", "ag@experrt.com", "ops@example.com"],
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        enquiryType: "education",
      }),
    );
  });
});
