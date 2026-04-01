import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureFeaturedPublicQuizExistsMock = vi.fn();
const getCurrentSessionMock = vi.fn();
const submitQuizAttemptMock = vi.fn();
const generateQuizAiFeedbackMock = vi.fn();
const getQuizUpsellCoursesWithReasonsMock = vi.fn();
const sendQuizResultEmailMock = vi.fn();
const sendNewQuizLeadEmailMock = vi.fn();
const getOperationalAdminRecipientsMock = vi.fn();
const isFeaturedPublicScalpQuizMock = vi.fn();
const buildPublicScalpQuizSubmissionMock = vi.fn();
const quizFindUniqueMock = vi.fn();
const contactUpsertMock = vi.fn();
const quizAttemptUpdateMock = vi.fn();
const quizAttemptCreateMock = vi.fn();
const activityCreateMock = vi.fn();
const activityCreateManyMock = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: {
      findUnique: quizFindUniqueMock,
    },
    contact: {
      upsert: contactUpsertMock,
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    quizAttempt: {
      create: quizAttemptCreateMock,
      update: quizAttemptUpdateMock,
    },
    activity: {
      create: activityCreateMock,
      createMany: activityCreateManyMock,
    },
  },
}));

vi.mock("@/server/modules/education/quiz", () => ({
  submitQuizAttempt: submitQuizAttemptMock,
}));

vi.mock("@/server/modules/education/featuredPublicQuiz", () => ({
  ensureFeaturedPublicQuizExists: ensureFeaturedPublicQuizExistsMock,
}));

vi.mock("@/server/modules/education/quizAi", () => ({
  generateQuizAiFeedback: generateQuizAiFeedbackMock,
}));

vi.mock("@/server/modules/education/recommendations", () => ({
  getQuizUpsellCoursesWithReasons: getQuizUpsellCoursesWithReasonsMock,
}));

vi.mock("@/server/security/auth", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendQuizResultEmail: sendQuizResultEmailMock,
  sendNewQuizLeadEmail: sendNewQuizLeadEmailMock,
}));

vi.mock("@/server/modules/settings/notifications", () => ({
  getOperationalAdminRecipients: getOperationalAdminRecipientsMock,
}));

vi.mock("@/server/modules/education/publicScalpQuiz", () => ({
  buildPublicScalpQuizSubmission: buildPublicScalpQuizSubmissionMock,
  getPublicScalpQuizLeadSummary: vi.fn(),
  isFeaturedPublicScalpQuiz: isFeaturedPublicScalpQuizMock,
}));

vi.mock("@/lib/publicQuiz", () => ({
  PROFESSIONAL_GATED_QUIZ_SLUG: "professional-quiz",
}));

describe("public quiz submit admin emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureFeaturedPublicQuizExistsMock.mockResolvedValue(undefined);
    getCurrentSessionMock.mockResolvedValue(null);
    quizFindUniqueMock.mockResolvedValue({
      id: "quiz_1",
      slug: "starter-quiz",
      title: "Starter Quiz",
      isPublic: true,
      status: "PUBLISHED",
      passingScore: 70,
      resultsCopy: null,
      recommendedCourse: null,
      questions: [
        {
          id: "q_1",
          position: 1,
          questionText: "Question 1",
          questionType: "MULTIPLE_CHOICE",
        },
      ],
    });
    contactUpsertMock.mockResolvedValue({
      id: "contact_1",
      email: "learner@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });
    submitQuizAttemptMock.mockResolvedValue({
      id: "attempt_1",
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
      answers: [{ questionId: "q_1", answer: "A", isCorrect: true }],
    });
    generateQuizAiFeedbackMock.mockResolvedValue({
      headline: "Strong result",
      summary: "You did well.",
      nextSteps: ["Keep learning"],
    });
    quizAttemptUpdateMock.mockResolvedValue({
      id: "attempt_1",
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
    });
    getQuizUpsellCoursesWithReasonsMock.mockResolvedValue([]);
    getOperationalAdminRecipientsMock.mockResolvedValue([
      "ops@example.com",
      "team@example.com",
    ]);
    isFeaturedPublicScalpQuizMock.mockReturnValue(false);
    buildPublicScalpQuizSubmissionMock.mockReturnValue({
      attemptAnswers: [],
      result: {
        scoreBreakdown: { dryness: 8 },
        primaryConcern: { key: "dryness", label: "Dryness" },
        secondaryConcern: null,
        triage: "learn",
        resultMode: "scalp",
        headline: "Scalp insight",
        summary: "Summary",
        nextSteps: ["Hydrate"],
        redFlags: [],
        bookingCta: null,
        secondaryCta: null,
      },
    });
    quizAttemptCreateMock.mockResolvedValue({
      id: "attempt_scalp_1",
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
    });
    sendQuizResultEmailMock.mockResolvedValue({ skipped: false, id: "msg_1" });
    sendNewQuizLeadEmailMock.mockResolvedValue({ skipped: false, id: "msg_2" });
  });

  it("sends quiz lead emails to the shared admin recipient list and logs the actual recipients", async () => {
    const { POST } = await import("@/app/api/public/quiz/[slug]/submit/route");

    const response = await POST(
      new Request("http://localhost/api/public/quiz/starter-quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Doe",
          email: "learner@example.com",
          answers: [{ questionId: "q_1", answer: "A" }],
        }),
      }),
      { params: { slug: "starter-quiz" } },
    );

    expect(response.status).toBe(200);
    expect(getOperationalAdminRecipientsMock).toHaveBeenCalledTimes(1);
    expect(sendNewQuizLeadEmailMock).toHaveBeenCalledTimes(2);
    expect(sendNewQuizLeadEmailMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "ops@example.com",
        contactId: "contact_1",
      }),
    );
    expect(sendNewQuizLeadEmailMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "team@example.com",
        contactId: "contact_1",
      }),
    );
    expect(activityCreateManyMock).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          subject: "Admin notification: new quiz lead",
          body: "Sent to: ops@example.com, team@example.com",
        }),
      ]),
    });
  });

  it("also routes scalp quiz emails through the shared admin recipient list", async () => {
    isFeaturedPublicScalpQuizMock.mockReturnValueOnce(true);

    const { POST } = await import("@/app/api/public/quiz/[slug]/submit/route");

    const response = await POST(
      new Request("http://localhost/api/public/quiz/scalp-check/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "learner@example.com",
          answers: [{ questionId: "q_1", answer: "A" }],
        }),
      }),
      { params: { slug: "scalp-check" } },
    );

    expect(response.status).toBe(200);
    expect(sendQuizResultEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
      }),
    );
    expect(sendNewQuizLeadEmailMock).toHaveBeenCalledTimes(2);
    expect(activityCreateManyMock).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          subject: "Admin notification: new quiz lead",
          body: "Sent to: ops@example.com, team@example.com",
        }),
      ]),
    });
  });
});
