import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const getCurrentSessionMock = vi.fn();
const userFindUniqueMock = vi.fn();
const videoProductFindUniqueMock = vi.fn();
const createCheckoutSessionMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: vi.fn(),
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
    videoProduct: {
      findUnique: videoProductFindUniqueMock,
    },
  },
}));

vi.mock("@/server/modules/education/service", () => ({
  createCheckoutSession: createCheckoutSessionMock,
}));

vi.mock("@prisma/client", () => ({
  BillingType: { ONE_TIME: "ONE_TIME" },
  BillingCycle: { MONTHLY: "MONTHLY", YEARLY: "YEARLY" },
  CourseLevel: { GENERAL: "GENERAL" },
  CourseStatus: {
    DRAFT: "DRAFT",
    REVIEW: "REVIEW",
    PUBLISHED: "PUBLISHED",
    RETIRED: "RETIRED",
  },
  EnrollmentStatus: { ACTIVE: "ACTIVE" },
  EnrollmentType: { ON_DEMAND: "ON_DEMAND" },
  SessionStatus: { UPCOMING: "UPCOMING" },
}));

vi.mock("@/server/schema", () => ({
  courseLessonSchema: z.object({ title: z.string().optional() }),
  courseModuleSchema: z.object({ title: z.string().optional() }),
  coursePriceSchema: z.object({ amount: z.number().optional() }),
  courseSessionSchema: z.object({ title: z.string().optional() }),
  courseUpsertSchema: z.object({ title: z.string().optional() }),
  videoProductPriceSchema: z.object({
    videoProductId: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    billingType: z.string().optional(),
    billingCycle: z.string().optional(),
    isPrimary: z.boolean().optional(),
    priceExternalId: z.string().optional(),
  }),
  videoProductUpsertSchema: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    status: z.string().optional(),
    videoSourceType: z.string().optional(),
    videoUrl: z.string().optional().nullable(),
    isFreeOnSignup: z.boolean().optional(),
  }),
  workshopUpsertSchema: z.object({ title: z.string().optional() }),
}));

describe("startVideoCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("requires the learner to be signed in before starting video checkout", async () => {
    getCurrentSessionMock.mockResolvedValueOnce(null);
    videoProductFindUniqueMock.mockResolvedValueOnce({
      id: "ckvideo123456789012345678",
      title: "Sensitive scalps",
    });

    const { startVideoCheckout } = await import("@/app/actions/education");

    await expect(
      startVideoCheckout("ckvideo123456789012345678", "ckprice1234567890123456")
    ).rejects.toThrow("Please sign in or create an account to purchase this video.");
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("hydrates video checkout with the signed-in learner contact", async () => {
    getCurrentSessionMock.mockResolvedValueOnce({
      uid: "u1",
      role: "LEARNER",
      exp: 9999999999,
    });
    videoProductFindUniqueMock.mockResolvedValueOnce({
      id: "ckvideo123456789012345678",
      title: "Sensitive scalps",
    });
    userFindUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "member@example.com",
      contactId: "c1",
    });
    createCheckoutSessionMock.mockResolvedValueOnce({
      id: "sess_1",
      url: "https://stripe.test/session/1",
    });

    const { startVideoCheckout } = await import("@/app/actions/education");

    await startVideoCheckout("ckvideo123456789012345678", "ckprice1234567890123456");

    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productType: "VIDEO",
        productId: "ckvideo123456789012345678",
        priceId: "ckprice1234567890123456",
        contactId: "c1",
        metadata: {
          userId: "u1",
          userEmail: "member@example.com",
        },
      })
    );
    expect(redirectMock).toHaveBeenCalledWith("https://stripe.test/session/1");
  });
});
