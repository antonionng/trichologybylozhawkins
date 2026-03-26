import { beforeEach, describe, expect, it, vi } from "vitest";

const sendAcademySignupWelcomeEmailMock = vi.fn();
const sendEducationPurchaseConfirmationEmailMock = vi.fn();
const getServerEnvMock = vi.fn();

vi.mock("@/server/modules/email/transactional", () => ({
  sendAcademySignupWelcomeEmail: sendAcademySignupWelcomeEmailMock,
  sendEducationPurchaseConfirmationEmail: sendEducationPurchaseConfirmationEmailMock,
}));

vi.mock("@/server/schema", () => ({
  getServerEnv: getServerEnvMock,
}));

describe("education notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerEnvMock.mockReturnValue({
      NEXT_PUBLIC_APP_URL: "https://example.com",
    });
  });

  it("sends an academy signup welcome email", async () => {
    const { sendAcademySignupNotifications } = await import("@/server/modules/education/notifications");

    await sendAcademySignupNotifications({
      contactId: "contact_1",
      email: "learner@example.com",
      firstName: "Jane",
      lastName: "Doe",
      videoTitle: "Sensitive scalps",
    });

    expect(sendAcademySignupWelcomeEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
        firstName: "Jane",
        appUrl: "https://example.com",
        videoTitle: "Sensitive scalps",
      }),
    );
  });

  it("sends an education purchase confirmation email", async () => {
    const { sendEducationPurchaseNotifications } = await import("@/server/modules/education/notifications");

    await sendEducationPurchaseNotifications({
      orderId: "ord_1",
      email: "learner@example.com",
      firstName: "Jane",
      lastName: "Doe",
      totalAmount: 29,
      currency: "GBP",
      items: [
        { name: "Sensitive scalps", quantity: 1, unitAmount: 29, currency: "GBP" },
      ],
    });

    expect(sendEducationPurchaseConfirmationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
        orderId: "ord_1",
        appUrl: "https://example.com",
        customerName: "Jane Doe",
      }),
    );
  });
});
