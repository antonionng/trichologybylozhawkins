import { beforeEach, describe, expect, it, vi } from "vitest";

const quizFindFirstMock = vi.fn();
const videoProductFindFirstMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: {
      findFirst: quizFindFirstMock,
    },
    videoProduct: {
      findFirst: videoProductFindFirstMock,
    },
  },
}));

describe("featured lead item resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the featured quiz before a featured video when both exist", async () => {
    quizFindFirstMock.mockResolvedValueOnce({
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
    });
    videoProductFindFirstMock.mockResolvedValueOnce({
      id: "video_1",
      slug: "menopause-hair-loss",
      title: "Menopause & Hair Loss",
    });

    const { getCurrentFeaturedLeadItem } = await import("@/server/modules/education/featuredLeadItem");
    const item = await getCurrentFeaturedLeadItem();

    expect(item).toEqual(
      expect.objectContaining({
        kind: "QUIZ",
        slug: "scalp-health-check",
      }),
    );
  });

  it("falls back to the free signup video when no featured quiz is configured", async () => {
    quizFindFirstMock.mockResolvedValueOnce(null);
    videoProductFindFirstMock.mockResolvedValueOnce({
      id: "video_1",
      slug: "menopause-hair-loss",
      title: "Menopause & Hair Loss",
    });

    const { getCurrentFeaturedLeadItem } = await import("@/server/modules/education/featuredLeadItem");
    const item = await getCurrentFeaturedLeadItem();

    expect(item).toEqual(
      expect.objectContaining({
        kind: "VIDEO",
        slug: "menopause-hair-loss",
      }),
    );
  });
});
