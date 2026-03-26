import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const sendEducationPurchaseNotificationsMock = vi.fn();
const orderFindFirstMock = vi.fn();
const orderFindUniqueMock = vi.fn();
const orderUpdateMock = vi.fn();
const enrollmentFindFirstMock = vi.fn();
const enrollmentCreateMock = vi.fn();
const videoAccessFindFirstMock = vi.fn();
const videoAccessCreateMock = vi.fn();

vi.mock("@/server/modules/education/notifications", () => ({
  sendEducationPurchaseNotifications: sendEducationPurchaseNotificationsMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    order: {
      findFirst: orderFindFirstMock,
      findUnique: orderFindUniqueMock,
      update: orderUpdateMock,
    },
    enrollment: {
      findFirst: enrollmentFindFirstMock,
      create: enrollmentCreateMock,
    },
    videoAccess: {
      findFirst: videoAccessFindFirstMock,
      create: videoAccessCreateMock,
    },
  },
}));

vi.mock("@/server/schema", () => ({
  checkoutSessionSchema: z.object({}),
  courseEnquirySchema: z.object({}),
  courseLessonSchema: z.object({}),
  courseModuleSchema: z.object({}),
  coursePriceSchema: z.object({}),
  courseSessionSchema: z.object({}),
  courseUpsertSchema: z.object({}),
  enrollmentUpdateSchema: z.object({}),
  getServerEnv: vi.fn(),
  videoProductPriceSchema: z.object({}),
  videoProductUpsertSchema: z.object({}),
}));

vi.mock("@prisma/client", () => ({
  EnrollmentStatus: { ACTIVE: "ACTIVE" },
  PaymentEventType: {
    PAYMENT_SUCCEEDED: "PAYMENT_SUCCEEDED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
  },
}));

describe("education service email hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enrollmentFindFirstMock.mockResolvedValue(null);
    videoAccessFindFirstMock.mockResolvedValue(null);
  });

  it("looks up the order by providerSessionId and triggers purchase notifications after successful fulfillment", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "ord_1",
      contactId: "contact_1",
      status: "PENDING",
      currency: "GBP",
      totalAmount: 29,
      contact: {
        id: "contact_1",
        email: "learner@example.com",
        firstName: "Jane",
        lastName: "Doe",
      },
      items: [
        {
          courseId: null,
          videoProductId: "video_1",
          unitAmount: 29,
          currency: "GBP",
        },
      ],
    });
    orderUpdateMock.mockResolvedValueOnce({});

    const { handleCheckoutFulfillment } = await import("@/server/modules/education/service");

    await handleCheckoutFulfillment({
      providerSessionId: "sess_1",
      paymentIntentId: "pi_1",
      status: "succeeded",
      payload: {},
    });

    expect(orderFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerSessionId: "sess_1" },
        include: expect.objectContaining({
          contact: true,
          items: expect.any(Object),
        }),
      }),
    );
    expect(orderFindUniqueMock).not.toHaveBeenCalled();
    expect(sendEducationPurchaseNotificationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "ord_1",
        email: "learner@example.com",
        totalAmount: 29,
      }),
    );
  });
});
