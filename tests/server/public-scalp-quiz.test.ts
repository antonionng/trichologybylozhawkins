import { describe, expect, it } from "vitest";
import {
  buildPublicScalpQuizSubmission,
  evaluatePublicScalpQuiz,
  getFeaturedPublicScalpQuizContent,
  getPublicScalpQuizLeadSummary,
  publicScalpQuizDefinition,
} from "@/server/modules/education/publicScalpQuiz";

describe("evaluatePublicScalpQuiz", () => {
  it("identifies a flaking and inflammation pattern without urgent escalation", () => {
    const result = evaluatePublicScalpQuiz({
      mainConcern: "flakes_itch",
      scalpFeel: "itch",
      visibleChanges: "yellow_scale",
      onset: "comes_and_goes",
      triggers: "winter_or_weather",
      severity: "moderate",
      redFlags: "none",
    });

    expect(result.primaryConcern.key).toBe("flakingInflammation");
    expect(result.triage).toBe("routine");
    expect(result.redFlags).toEqual([]);
    expect(result.bookingCta.label).toBe("Book a scalp consultation with Lorraine");
    expect(result.summary).toContain("not a medical diagnosis");
  });

  it("elevates patchy loss with pain or eyebrow changes into prompt assessment", () => {
    const result = evaluatePublicScalpQuiz({
      mainConcern: "patchy_loss",
      scalpFeel: "sore_burning",
      visibleChanges: "round_patches",
      onset: "rapid_or_sudden",
      triggers: "none",
      severity: "rapid_or_worsening",
      redFlags: "eyebrow_or_eyelash_loss",
    });

    expect(result.primaryConcern.key).toBe("patchyLoss");
    expect(result.triage).toBe("prompt");
    expect(result.redFlags).toEqual([
      "Scalp pain, burning, or visible inflammation",
      "Patchy hair loss or clearly defined bare areas",
      "Rapid change or worsening symptoms",
      "Loss affecting eyebrows or eyelashes",
    ]);
    expect(result.bookingCta.label).toBe("Book a priority scalp consultation");
    expect(result.headline).toContain("prompt professional assessment");
  });
});

describe("getPublicScalpQuizLeadSummary", () => {
  it("builds a consultation-ready summary for the contact flow", () => {
    const result = evaluatePublicScalpQuiz({
      mainConcern: "tight_styles",
      scalpFeel: "tender_hairline",
      visibleChanges: "broken_hairs_hairline",
      onset: "gradual_over_months",
      triggers: "tight_styles",
      severity: "moderate",
      redFlags: "none",
    });

    expect(getPublicScalpQuizLeadSummary(result)).toBe(
      [
        "Quiz source: scalp health check",
        "Likely concern: Tension or styling-related hairline stress",
        "Triage: routine",
        "Top next steps:",
        "- Loosen high-tension styles and reduce repeated pulling on the same areas.",
        "- Book a scalp consultation if the hairline is thinning, sore, or not improving.",
      ].join("\n")
    );
  });
});

describe("getFeaturedPublicScalpQuizContent", () => {
  it("exposes consumer-facing quiz copy and seeded questions", () => {
    const quiz = getFeaturedPublicScalpQuizContent();

    expect(quiz.title).toBe("Scalp Health Check");
    expect(quiz.description).toContain("non-professionals");
    expect(quiz.description).toContain("not a medical diagnosis");
    expect(quiz.questions).toHaveLength(7);
    expect(quiz.questions[0]?.questionText).toBe("What best describes your main concern right now?");
    expect(quiz.questions[0]?.options).toContain("Flaking, itch, or irritation");
  });
});

describe("buildPublicScalpQuizSubmission", () => {
  it("maps stored answers into a consumer result payload for the quiz UI", () => {
    const submission = buildPublicScalpQuizSubmission({
      quizQuestions: publicScalpQuizDefinition.map((question, index) => ({
        id: `q${index}`,
        position: index,
        questionText: question.questionText,
      })),
      answers: [
        { questionId: "q0", answer: 0 },
        { questionId: "q1", answer: 0 },
        { questionId: "q2", answer: 0 },
        { questionId: "q3", answer: 3 },
        { questionId: "q4", answer: 3 },
        { questionId: "q5", answer: 1 },
        { questionId: "q6", answer: 0 },
      ],
    });

    expect(submission.result.resultMode).toBe("consumer_scalp");
    expect(submission.result.primaryConcern.label).toBe("Flaking and inflammation pattern");
    expect(submission.result.secondaryCta.href).toBe("/education/conditions");
    expect(submission.attemptAnswers[0]).toEqual({
      questionId: "q0",
      answer: 0,
      answerLabel: "Flaking, itch, or irritation",
      optionValue: "flakes_itch",
      isCorrect: false,
    });
  });
});
