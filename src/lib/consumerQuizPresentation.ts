export function getConsumerQuizIntro(questionCount: number) {
  return {
    eyebrow: "Lorraine's scalp guidance",
    title: "A calmer way to understand what your scalp may need",
    body:
      "This guided check is designed for people dealing with scalp discomfort, shedding, or thinning. It offers supportive next steps, not a medical diagnosis.",
    benefits: [
      "Built for personal scalp concerns, not professionals",
      `${questionCount} gentle guided steps`,
      "Clear next steps and booking support",
    ],
    reassurance:
      "Answer as closely as you can. Lorraine will turn your answers into a simple guidance summary and let you know when it is worth booking in.",
    startLabel: "Begin my scalp check",
  };
}

export function getConsumerQuizQuestionCopy(currentStep: number, totalSteps: number) {
  return {
    stepLabel: `Step ${currentStep} of ${totalSteps}`,
    supportingText:
      "Choose the answer that feels closest. This helps Lorraine shape your guidance.",
    answeredLabel: "Steps completed",
    nextLabel: "Continue",
    previousLabel: "Back",
    submitLabel: "See Lorraine's guidance",
  };
}

export function getConsumerQuizGateCopy() {
  return {
    eyebrow: "See Lorraine's guidance",
    title: "Save your personalised scalp summary",
    body:
      "Add your email to view your guidance summary, likely concern pattern, and the best next step if you want to book with Lorraine.",
    submitLabel: "Show my guidance",
    backLabel: "Back to my answers",
  };
}

export function getConsumerQuizResultCopy() {
  return {
    eyebrow: "Your personalised scalp guidance",
    summaryLabel: "Lorraine's summary",
    concernLabel: "Likely concern pattern",
    nextStepsLabel: "What to do next",
    followUpLabel: "Worth quicker follow-up",
    restartLabel: "Retake the quiz",
    secondaryPatternLabel: "Also worth noting",
  };
}
