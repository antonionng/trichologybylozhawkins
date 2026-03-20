import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuizTaker } from "@/components/education/QuizTaker";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/components/layout/Surface", () => ({
  Surface: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  }) => React.createElement("button", props, children),
}));

vi.mock("@/components/education/PurchaseButton", () => ({
  PurchaseButton: () => React.createElement("button", null, "Purchase"),
}));

const quiz = {
  id: "quiz-1",
  slug: "sample-quiz",
  title: "Trichocare Phase 1 Exam - Days 1-4",
  description: "Assessment covering Days 1-4 of the Trichocare Phase 1 program.",
  passingScore: 70,
  timeLimit: null,
  course: {
    id: "course-1",
    title: "Trichocare Phase 1",
    slug: "trichocare-phase-1",
  },
  questions: [
    {
      id: "q1",
      position: 0,
      questionText: "Question one",
      questionType: "MULTIPLE_CHOICE",
      options: ["A", "B"],
      points: 1,
    },
    {
      id: "q2",
      position: 1,
      questionText: "Question two",
      questionType: "MULTIPLE_CHOICE",
      options: ["A", "B"],
      points: 1,
    },
  ],
};

describe("QuizTaker start states", () => {
  it("renders a lighter academy start card without repeating stats", () => {
    const html = renderToStaticMarkup(
      <QuizTaker quiz={quiz} mode="academy" />,
    );

    expect(html).toContain("Ready to begin");
    expect(html).toContain("Start quiz");
    expect(html).not.toContain("To Pass");
    expect(html).not.toContain("Time Limit");
  });

  it("renders a cleaner public start card focused on guidance", () => {
    const html = renderToStaticMarkup(
      <QuizTaker quiz={quiz} mode="public_consumer" />,
    );

    expect(html).toContain("Before you start");
    expect(html).toContain("Begin my scalp check");
    expect(html).not.toContain("Trichocare Phase 1 Exam - Days 1-4");
  });

  it("keeps the professional gated quiz in a quiz-style start state", () => {
    const html = renderToStaticMarkup(
      <QuizTaker quiz={quiz} mode="public_signup_gate" />,
    );

    expect(html).toContain("Start when you are ready");
    expect(html).toContain("Start quiz");
    expect(html).not.toContain("Begin my scalp check");
    expect(html).not.toContain("A quick guidance check");
  });
});
