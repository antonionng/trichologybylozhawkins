import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserOrRedirectMock = vi.fn();
const revalidatePathMock = vi.fn();
const upsertVideoProductMock = vi.fn();
const videoProductUpdateManyMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: requireUserOrRedirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/server/modules/education/service", () => ({
  upsertVideoProduct: upsertVideoProductMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    videoProduct: {
      updateMany: videoProductUpdateManyMock,
    },
  },
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
    title: z.string(),
    slug: z.string(),
    status: z.string().optional(),
    videoSourceType: z.string(),
    videoUrl: z.string().optional().nullable(),
    isFreeOnSignup: z.boolean().optional(),
  }),
  workshopUpsertSchema: z.object({ title: z.string().optional() }),
}));

describe("education video product actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    videoProductUpdateManyMock.mockResolvedValue({ count: 0 });
  });

  it("passes the free-on-signup flag through the admin save action", async () => {
    requireUserOrRedirectMock.mockResolvedValueOnce({
      user: { id: "admin_1", role: "ADMIN" },
    });
    upsertVideoProductMock.mockResolvedValueOnce({
      id: "video_1",
      slug: "menopause-hair-loss",
      isFreeOnSignup: true,
    });

    const { upsertVideoProduct } = await import("@/app/actions/education");

    await upsertVideoProduct({
      title: "Menopause & Hair Loss",
      slug: "menopause-hair-loss",
      status: "PUBLISHED",
      videoSourceType: "LINK",
      videoUrl: "https://example.com/video",
      isFreeOnSignup: true,
    });

    expect(upsertVideoProductMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isFreeOnSignup: true,
      }),
    );
    expect(videoProductUpdateManyMock).toHaveBeenCalledWith({
      where: {
        isFreeOnSignup: true,
      },
      data: {
        isFreeOnSignup: false,
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/education");
    expect(revalidatePathMock).toHaveBeenCalledWith("/education/videos/menopause-hair-loss");
  });
});
