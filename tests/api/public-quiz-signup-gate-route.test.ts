import { beforeEach, describe, expect, it, vi } from "vitest";

const quizFindUniqueMock = vi.fn();
const contactUpsertMock = vi.fn();
const quizAttemptCreateMock = vi.fn();
const activityCreateMock = vi.fn();
const ensureFeaturedPublicQuizExistsMock = vi.fn();
const getCurrentFeaturedLeadItemMock = vi.fn();
const getCurrentSessionMock = vi.fn();
const buildPublicScalpQuizSubmissionMock = vi.fn();
const getPublicScalpQuizLeadSummaryMock = vi.fn();
const isFeaturedPublicScalpQuizMock = vi.fn(() => false);

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: {
      findUnique: quizFindUniqueMock,
    },
    contact: {
      upsert: contactUpsertMock,
    },
    quizAttempt: {
      create: quizAttemptCreateMock,
    },
    activity: {
      create: activityCreateMock,
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
  buildPublicScalpQuizSubmission: buildPublicScalpQuizSubmissionMock,
  getPublicScalpQuizLeadSummary: getPublicScalpQuizLeadSummaryMock,
  isFeaturedPublicScalpQuiz: isFeaturedPublicScalpQuizMock,
}));

vi.mock("@prisma/client", () => ({
  ActivityType: { NOTE: "NOTE", EMAIL: "EMAIL" },
}));

describe("POST /api/public/quiz/[slug]/submit signup gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quizAttemptCreateMock.mockResolvedValue({ id: "attempt_1" });
    activityCreateMock.mockResolvedValue({ id: "activity_1" });
    getPublicScalpQuizLeadSummaryMock.mockReturnValue("Scalp quiz summary");
  });

  it("returns a signup gate teaser for the professional featured quiz when the user is not signed in", async () => {
    ensureFeaturedPublicQuizExistsMock.mockResolvedValueOnce(undefined);
    getCurrentFeaturedLeadItemMock.mockResolvedValueOnce({
      kind: "QUIZ",
      id: "quiz_1",
      slug: "trichology-knowledge-check",
      title: "Trichology Knowledge Check",
    });
    getCurrentSessionMock.mockResolvedValueOnce(null);
    quizFindUniqueMock.mockResolvedValueOnce({
      id: "quiz_1",
      slug: "trichology-knowledge-check",
      title: "Trichology Knowledge Check",
      isPublic: true,
      status: "PUBLISHED",
      questions: [
        { id: "q1", position: 0, questionText: "Question 1", questionType: "MULTIPLE_CHOICE" },
      ],
      recommendedCourse: null,
    });

    const { POST } = await import("@/app/api/public/quiz/[slug]/submit/route");

    const response = await POST(
      new Request("http://localhost/api/public/quiz/trichology-knowledge-check/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [{ questionId: "q1", answer: "Yes" }],
        }),
      }),
      { params: { slug: "trichology-knowledge-check" } },
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

  it("accepts an email-only scalp quiz submission and stores a trichology prospect contact", async () => {
    ensureFeaturedPublicQuizExistsMock.mockResolvedValueOnce(undefined);
    getCurrentFeaturedLeadItemMock.mockResolvedValueOnce({
      kind: "QUIZ",
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
    });
    getCurrentSessionMock.mockResolvedValueOnce(null);
    isFeaturedPublicScalpQuizMock.mockReturnValueOnce(true);
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
    contactUpsertMock.mockResolvedValueOnce({
      id: "contact_1",
      email: "guest@example.com",
      firstName: "Guest",
      lastName: "",
    });
    buildPublicScalpQuizSubmissionMock.mockReturnValueOnce({
      attemptAnswers: [{ questionId: "q1", answer: 0, answerLabel: "Yes", optionValue: "dry_tight", isCorrect: false }],
      result: {
        resultMode: "consumer_scalp",
        headline: "Scalp guidance",
        summary: "Summary",
        triage: "routine",
        primaryConcern: { key: "drySensitive", label: "Dry and sensitive scalp pattern" },
        secondaryConcern: null,
        nextSteps: ["Step 1"],
        redFlags: [],
        bookingCta: { href: "/contact?service=clinic", label: "Book consultation" },
        secondaryCta: { href: "/education/conditions", label: "Learn more" },
        scoreBreakdown: {
          flakingInflammation: 0,
          oilBuildUp: 0,
          drySensitive: 3,
          stressShedding: 0,
          patternThinning: 0,
          tractionTension: 0,
          patchyLoss: 0,
        },
      },
    });

    const { POST } = await import("@/app/api/public/quiz/[slug]/submit/route");

    const response = await POST(
      new Request("http://localhost/api/public/quiz/scalp-health-check/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "guest@example.com",
          answers: [{ questionId: "q1", answer: 0 }],
        }),
      }),
      { params: { slug: "scalp-health-check" } },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        resultMode: "consumer_scalp",
        headline: "Scalp guidance",
      }),
    );
    expect(contactUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "guest@example.com" },
        update: expect.objectContaining({
          source: "trichology_quiz",
        }),
        create: expect.objectContaining({
          source: "trichology_quiz",
        }),
      }),
    );
  });
});
