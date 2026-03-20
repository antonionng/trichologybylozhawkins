import { describe, expect, it } from "vitest";
import {
  getConsumerQuizGateCopy,
  getConsumerQuizIntro,
  getConsumerQuizQuestionCopy,
  getConsumerQuizResultCopy,
} from "@/lib/consumerQuizPresentation";

describe("consumer quiz presentation copy", () => {
  it("frames the intro like guidance rather than an exam", () => {
    const intro = getConsumerQuizIntro(7);

    expect(intro.eyebrow).toBe("Lorraine's scalp guidance");
    expect(intro.benefits).toEqual([
      "Built for personal scalp concerns, not professionals",
      "7 gentle guided steps",
      "Clear next steps and booking support",
    ]);
    expect(intro.startLabel).toBe("Begin my scalp check");
  });

  it("uses consultation-led language during the question flow", () => {
    const questionCopy = getConsumerQuizQuestionCopy(2, 7);

    expect(questionCopy.stepLabel).toBe("Step 2 of 7");
    expect(questionCopy.supportingText).toBe(
      "Choose the answer that feels closest. This helps Lorraine shape your guidance."
    );
    expect(questionCopy.submitLabel).toBe("See Lorraine's guidance");
  });

  it("softens the lead gate and result labels", () => {
    const gateCopy = getConsumerQuizGateCopy();
    const resultCopy = getConsumerQuizResultCopy();

    expect(gateCopy.eyebrow).toBe("See Lorraine's guidance");
    expect(gateCopy.body).toContain("email");
    expect(gateCopy.body.toLowerCase()).not.toContain("details");
    expect(gateCopy.submitLabel).toBe("Show my guidance");
    expect(resultCopy.summaryLabel).toBe("Lorraine's summary");
    expect(resultCopy.nextStepsLabel).toBe("What to do next");
  });
});
