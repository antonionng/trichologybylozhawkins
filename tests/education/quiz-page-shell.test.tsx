import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuizPageShell } from "@/components/education/QuizPageShell";

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

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    React.createElement("img", props),
}));

vi.mock("@/components/layout/PageSection", () => ({
  PageSection: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
}));

vi.mock("@/components/layout/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/layout/Surface", () => ({
  Surface: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/typography/SectionHeading", () => ({
  SectionHeading: ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
  }) =>
    React.createElement(
      "header",
      null,
      eyebrow ? React.createElement("p", null, eyebrow) : null,
      React.createElement("h2", null, title),
      description ? React.createElement("p", null, description) : null,
    ),
}));

describe("QuizPageShell", () => {
  it("renders shared shell content, stats, image, and quiz slot", () => {
    const html = renderToStaticMarkup(
      <QuizPageShell
        variant="academy"
        eyebrow="Trichocare phase 1"
        title="Trichocare Phase 1 Exam - Days 1-4"
        description="Assessment covering Days 1-4 of the Trichocare Phase 1 program."
        backHref="/academy?tab=quizzes"
        backLabel="Back to quizzes"
        heroUrl="https://images.example/quiz.jpg"
        heroAlt="Quiz hero"
        stats={[
          { label: "Questions", value: "20" },
          { label: "Pass mark", value: "70%" },
          { label: "Course", value: "Trichocare Phase 1" },
        ]}
        supportingPanel={
          <div>
            <p>Support panel</p>
          </div>
        }
      >
        <div>Quiz body slot</div>
      </QuizPageShell>,
    );

    expect(html).toContain("Back to quizzes");
    expect(html).toContain("Trichocare Phase 1 Exam - Days 1-4");
    expect(html).toContain("Assessment covering Days 1-4");
    expect(html).toContain("Questions");
    expect(html).toContain("70%");
    expect(html).toContain("Quiz body slot");
    expect(html).toContain("Support panel");
    expect(html).toContain("src=\"https://images.example/quiz.jpg\"");
    expect(html).toContain("alt=\"Quiz hero\"");
  });
});
