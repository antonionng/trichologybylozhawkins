import { describe, expect, it } from "vitest";
import {
  quizCardImages,
  resolveQuizCardImage,
} from "@/lib/quizCardImagePool";

describe("resolveQuizCardImage", () => {
  it("does not use the old salon-group image for knowledge checks", () => {
    expect(quizCardImages.knowledgeCheck).not.toBe(
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=960&q=80&auto=format&fit=crop"
    );
  });

  it("does not keep the broken scalp artwork URL", () => {
    expect(quizCardImages.scalpInflammation).not.toBe(
      "https://images.unsplash.com/photo-1570172619643-d9fcde710d99?w=960&q=80&auto=format&fit=crop"
    );

    expect(quizCardImages.complexCaseManagement).not.toBe(
      "https://images.unsplash.com/photo-1570172619643-d9fcde710d99?w=960&q=80&auto=format&fit=crop"
    );
  });

  it("matches dedicated images for standalone quiz slugs", () => {
    expect(
      resolveQuizCardImage({ slug: "trichology-knowledge-check" })
    ).toBe(quizCardImages.knowledgeCheck);

    expect(
      resolveQuizCardImage({ slug: "female-pattern-hair-loss" })
    ).toBe(quizCardImages.femalePattern);

    expect(
      resolveQuizCardImage({ slug: "nutrition-hair-health" })
    ).toBe(quizCardImages.nutrition);

    expect(
      resolveQuizCardImage({ slug: "scalp-health-check" })
    ).toBe(quizCardImages.scalpInflammation);
  });

  it("matches seeded exam titles to relevant course artwork", () => {
    expect(
      resolveQuizCardImage({ title: "Trichocare Phase 1 Exam - Days 1-4" })
    ).toBe(quizCardImages.knowledgeCheck);

    expect(
      resolveQuizCardImage({ title: "Multi-Disciplinary Practice Assessment" })
    ).toBe(quizCardImages.multiDisciplinaryPractice);

    expect(
      resolveQuizCardImage({ title: "Complex Case Management Assessment" })
    ).toBe(quizCardImages.complexCaseManagement);

    expect(
      resolveQuizCardImage({ title: "Structured Hair Loss Assessment Assessment" })
    ).toBe(quizCardImages.structuredAssessment);

    expect(
      resolveQuizCardImage({ title: "Advanced Trichoscopy & Microscopy Assessment" })
    ).toBe(quizCardImages.trichoscopy);

    expect(
      resolveQuizCardImage({ title: "Systematic Scalp Examination Assessment" })
    ).toBe(quizCardImages.scalpExamination);

    expect(
      resolveQuizCardImage({ title: "Recognising Common Scalp Concerns Assessment" })
    ).toBe(quizCardImages.scalpConcerns);

    expect(
      resolveQuizCardImage({ title: "Day 5: Common Hair Loss Conditions Assessment" })
    ).toBe(quizCardImages.hairLossConditions);

    expect(
      resolveQuizCardImage({ title: "Day 4: Diagnosis & Assessment Techniques Assessment" })
    ).toBe(quizCardImages.diagnosisAssessment);

    expect(
      resolveQuizCardImage({ title: "Day 7: Client Consultation Skills Assessment" })
    ).toBe(quizCardImages.consultationSkills);

    expect(
      resolveQuizCardImage({ title: "Day 8: Business & Practice Development Assessment" })
    ).toBe(quizCardImages.practiceDevelopment);
  });

  it("returns null for unknown quizzes", () => {
    expect(
      resolveQuizCardImage({ title: "Something Completely Custom" })
    ).toBeNull();
  });
});
