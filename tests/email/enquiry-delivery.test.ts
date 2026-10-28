import { beforeEach, describe, expect, it, vi } from "vitest";

const contactUpdateMock = vi.fn();
const courseEnquiryUpdateMock = vi.fn();
const activityCreateMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    contact: { update: contactUpdateMock },
    courseEnquiry: { update: courseEnquiryUpdateMock },
    activity: { create: activityCreateMock },
  },
}));

vi.mock("@/server/modules/email/transactional", () => ({
  getResendFromAddress: () => "Lorraine Hawkins <noreply@trichologyacademy.com>",
}));

describe("enquiry email delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactUpdateMock.mockResolvedValue({});
    courseEnquiryUpdateMock.mockResolvedValue({});
    activityCreateMock.mockResolvedValue({});
  });

  it("records rejected and skipped sends on the enquiry and contact", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendAndRecordEnquiryEmails } = await import(
      "@/server/modules/email/enquiry-delivery"
    );

    const outcome = await sendAndRecordEnquiryEmails({
      contactId: "contact_1",
      courseEnquiryId: "enquiry_1",
      jobs: [
        {
          name: "enquiry-confirmation",
          run: async () => ({ skipped: false, id: "msg_1" }),
        },
        {
          name: "enquiry-admin",
          run: async () => {
            throw new Error("Resend (enquiry-admin): domain is not verified");
          },
        },
      ],
    });

    expect(outcome.status).toBe("partial");
    expect(outcome.error).toContain("enquiry-admin");
    expect(contactUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact_1" },
        data: expect.objectContaining({
          enquiryNotificationStatus: "partial",
          enquiryNotificationError: expect.stringContaining("domain is not verified"),
        }),
      }),
    );
    expect(courseEnquiryUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "enquiry_1" },
        data: expect.objectContaining({
          notificationStatus: "partial",
        }),
      }),
    );
    expect(activityCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: "contact_1",
          type: "EMAIL",
          subject: "Enquiry notification email failed",
        }),
      }),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "[enquiry:email] Enquiry notification delivery failed",
      expect.objectContaining({
        contactId: "contact_1",
        status: "partial",
      }),
    );
    errorSpy.mockRestore();
  });

  it("does not write a failure activity when every email is delivered", async () => {
    const { sendAndRecordEnquiryEmails } = await import(
      "@/server/modules/email/enquiry-delivery"
    );

    const outcome = await sendAndRecordEnquiryEmails({
      contactId: "contact_1",
      jobs: [
        {
          name: "enquiry-admin",
          run: async () => ({ skipped: false, id: "msg_2" }),
        },
      ],
    });

    expect(outcome.status).toBe("sent");
    expect(activityCreateMock).not.toHaveBeenCalled();
    expect(contactUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          enquiryNotificationStatus: "sent",
          enquiryNotificationError: null,
        }),
      }),
    );
  });
});
