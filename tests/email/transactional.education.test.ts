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
        html: expect.stringContaining("Sensitive scalps"),
        text: expect.stringContaining("https://example.com/academy"),
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
        html: expect.stringContaining("Sensitive scalps"),
        text: expect.stringContaining("Total: GBP 29.00"),
      }),
    );
  });
});
