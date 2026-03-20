import { beforeEach, describe, expect, it, vi } from "vitest";

const quizFindUniqueMock = vi.fn();
const contactUpsertMock = vi.fn();
const ensureFeaturedPublicQuizExistsMock = vi.fn();
const getCurrentFeaturedLeadItemMock = vi.fn();
const getCurrentSessionMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: {
      findUnique: quizFindUniqueMock,
    },
    contact: {
      upsert: contactUpsertMock,
    },
  },
}));

vi.mock("@/server/modules/education/quiz", () => ({
  submitQuizAttempt: vi.fn(),
}));

vi.mock("@/server/modules/education/featuredPublicQuiz", () => ({
  ensureFeaturedPublicQuizExists: ensureFeaturedPublicQuizExistsMock,
}));

vi.mock("@/server/modules/education/featuredLeadItem", () => ({
  getCurrentFeaturedLeadItem: getCurrentFeaturedLeadItemMock,
}));

vi.mock("@/server/security/auth", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/modules/education/quizAi", () => ({
  generateQuizAiFeedback: vi.fn(),
}));

vi.mock("@/server/modules/education/recommendations", () => ({
  getQuizUpsellCoursesWithReasons: vi.fn(),
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendNewQuizLeadEmail: vi.fn(),
  sendQuizResultEmail: vi.fn(),
}));

vi.mock("@/server/modules/education/publicScalpQuiz", () => ({
  buildPublicScalpQuizSubmission: vi.fn(),
  getPublicScalpQuizLeadSummary: vi.fn(),
  isFeaturedPublicScalpQuiz: vi.fn(() => false),
}));

vi.mock("@prisma/client", () => ({
  ActivityType: { NOTE: "NOTE", EMAIL: "EMAIL" },
}));

describe("POST /api/public/quiz/[slug]/submit signup gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a signup gate teaser for the featured lead quiz when the user is not signed in", async () => {
    ensureFeaturedPublicQuizExistsMock.mockResolvedValueOnce(undefined);
    getCurrentFeaturedLeadItemMock.mockResolvedValueOnce({
      kind: "QUIZ",
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
    });
    getCurrentSessionMock.mockResolvedValueOnce(null);
    quizFindUniqueMock.mockResolvedValueOnce({
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
      isPublic: true,
      status: "PUBLISHED",
      questions: [
        { id: "q1", position: 0, questionText: "Question 1", questionType: "MULTIPLE_CHOICE" },
      ],
      recommendedCourse: null,
    });

    const { POST } = await import("@/app/api/public/quiz/[slug]/submit/route");

    const response = await POST(
      new Request("http://localhost/api/public/quiz/scalp-health-check/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [{ questionId: "q1", answer: "Yes" }],
        }),
      }),
      { params: { slug: "scalp-health-check" } },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        requiresSignup: true,
        signupPath: expect.stringContaining("/academy/signup?next="),
      }),
    );
    expect(contactUpsertMock).not.toHaveBeenCalled();
  });
});
