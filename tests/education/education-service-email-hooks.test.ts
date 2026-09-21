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
const contactFindUniqueMock = vi.fn();
const contactUpdateMock = vi.fn();
const contactCreateMock = vi.fn();

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
    contact: {
      findUnique: contactFindUniqueMock,
      update: contactUpdateMock,
      create: contactCreateMock,
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

  it("relinks a pending guest order to the Stripe-paid email before granting access", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "ord_2",
      contactId: "guest_1",
      status: "PENDING",
      currency: "GBP",
      totalAmount: 29,
      contact: {
        id: "guest_1",
        email: "pending+cs_live_abc@guest.trichologyacademy.local",
        firstName: "Guest",
        lastName: "Learner",
        source: "checkout-guest",
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
    contactFindUniqueMock.mockResolvedValueOnce(null);
    contactUpdateMock.mockResolvedValueOnce({
      id: "guest_1",
      email: "buyer@example.com",
      firstName: "Buyer",
      lastName: "Guest",
      source: "checkout",
    });
    orderUpdateMock.mockResolvedValueOnce({});

    const { handleCheckoutFulfillment } = await import("@/server/modules/education/service");

    await handleCheckoutFulfillment({
      providerSessionId: "sess_2",
      paymentIntentId: "pi_2",
      status: "succeeded",
      payload: {
        customer_details: { email: "Buyer@example.com", name: "Buyer Guest" },
      },
    });

    expect(contactUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "guest_1" },
        data: expect.objectContaining({
          email: "buyer@example.com",
          source: "checkout",
        }),
      }),
    );
    expect(orderUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: "guest_1",
          status: "PAID",
        }),
      }),
    );
    expect(sendEducationPurchaseNotificationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "buyer@example.com",
      }),
    );
  });
});
