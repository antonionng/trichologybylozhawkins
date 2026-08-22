import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

describe("education transactional emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.RESEND_FROM_EMAIL = "Lorraine Hawkins <no-reply@example.com>";
    sendMock.mockResolvedValue({ data: { id: "email_123" } });
  });

  it("sends an academy signup welcome email", async () => {
    const { sendAcademySignupWelcomeEmail } = await import("@/server/modules/email/transactional");

    const result = await sendAcademySignupWelcomeEmail({
      to: "learner@example.com",
      appUrl: "https://example.com",
      firstName: "Jane",
      videoTitle: "Sensitive scalps",
    });

    expect(result).toEqual({ skipped: false, id: "email_123" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
        subject: expect.stringContaining("Welcome"),
        html: expect.stringMatching(/Trichology Academy[\s\S]*Sensitive scalps/),
        text: expect.stringContaining("Lorraine Hawkins · Trichology Academy"),
      }),
    );
  });

  it("sends an education purchase confirmation email", async () => {
    const { sendEducationPurchaseConfirmationEmail } = await import("@/server/modules/email/transactional");

    const result = await sendEducationPurchaseConfirmationEmail({
      to: "learner@example.com",
      appUrl: "https://example.com",
      orderId: "ord_123",
      customerName: "Jane Doe",
      totalAmount: 29,
      currency: "GBP",
      items: [{ name: "Sensitive scalps", quantity: 1, unitAmount: 29, currency: "GBP" }],
    });

    expect(result).toEqual({ skipped: false, id: "email_123" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
        subject: expect.stringContaining("ord_123"),
        html: expect.stringMatching(/Trichology Academy[\s\S]*Sensitive scalps/),
        text: expect.stringMatching(
          /Lorraine Hawkins · Trichology Academy[\s\S]*Total: GBP 29\.00/,
        ),
      }),
    );
  });

  it("sends course enquiry admin mail to both inboxes with submitter reply-to", async () => {
    const { sendCourseEnquiryAdminEmail } = await import("@/server/modules/email/transactional");

    await sendCourseEnquiryAdminEmail({
      to: ["loz.hawkins95@gmail.com", "ag@experrt.com"],
      appUrl: "https://trichologyacademy.co.uk",
      contactId: "contact_1",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      courseTitle: "Advanced Trichology",
      message: "Can you recommend a course?",
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["loz.hawkins95@gmail.com", "ag@experrt.com"],
        replyTo: "jane@example.com",
        subject: expect.stringContaining("Advanced Trichology"),
      }),
    );
  });

  it("sends contact enquiry admin mail with submitter reply-to", async () => {
    const { sendAdminEnquiryNotificationEmail } = await import("@/server/modules/email/transactional");

    await sendAdminEnquiryNotificationEmail({
      to: ["loz.hawkins95@gmail.com", "ag@experrt.com"],
      appUrl: "https://trichologyacademy.co.uk",
      contactId: "contact_1",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      enquiryType: "clinic",
      message: "I would like a Knutsford consultation.",
      preferredContactMethod: "email",
      urgency: "normal",
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["loz.hawkins95@gmail.com", "ag@experrt.com"],
        replyTo: "jane@example.com",
        subject: expect.stringContaining("Jane Doe"),
      }),
    );
  });

  it("throws when Resend returns an API error so callers can log real failures", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "invalid_from_address", message: "Domain not verified" },
    });

    const { sendAcademySignupWelcomeEmail } = await import("@/server/modules/email/transactional");

    await expect(
      sendAcademySignupWelcomeEmail({
        to: "learner@example.com",
        appUrl: "https://example.com",
        firstName: "Jane",
      }),
    ).rejects.toThrow(/Resend \(academy-signup-welcome\): Domain not verified/);
  });
});
