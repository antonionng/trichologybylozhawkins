import { beforeEach, describe, expect, it, vi } from "vitest";

const quizFindFirstMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: {
      findFirst: quizFindFirstMock,
    },
  },
}));

describe("public quiz lookup compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to a legacy featured quiz query when hero image columns are unavailable", async () => {
    quizFindFirstMock
      .mockRejectedValueOnce(new Error('The column `Quiz.heroMediaId` does not exist in the current database.'))
      .mockResolvedValueOnce({
        slug: "scalp-health-check",
        title: "Scalp Health Check",
        description: "Consumer scalp quiz",
      });

    const { findHomepageFeaturedPublicQuizRecord } = await import("@/server/modules/education/publicQuizLookup");
    const quiz = await findHomepageFeaturedPublicQuizRecord("scalp-health-check");

    expect(quiz).toEqual({
      slug: "scalp-health-check",
      title: "Scalp Health Check",
      description: "Consumer scalp quiz",
      heroMediaId: null,
      cardImageUrl: null,
    });
    expect(quizFindFirstMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to a legacy public quiz query when hero image columns are unavailable", async () => {
    quizFindFirstMock
      .mockRejectedValueOnce(new Error('The column `Quiz.cardImageUrl` does not exist in the current database.'))
      .mockResolvedValueOnce({
        id: "quiz_1",
        slug: "scalp-health-check",
        title: "Scalp Health Check",
        description: "Consumer scalp quiz",
        passingScore: 70,
        timeLimit: null,
        courseId: "course_1",
      });

    const { findPublicQuizRecord } = await import("@/server/modules/education/publicQuizLookup");
    const quiz = await findPublicQuizRecord("scalp-health-check");

    expect(quiz).toEqual({
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
      description: "Consumer scalp quiz",
      passingScore: 70,
      timeLimit: null,
      courseId: "course_1",
      heroMediaId: null,
      cardImageUrl: null,
    });
    expect(quizFindFirstMock).toHaveBeenCalledTimes(2);
  });
});
