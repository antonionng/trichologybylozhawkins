import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("public quiz signup gate wiring", () => {
  it("uses a signup-gated mode for the professional quiz and stores a return path", () => {
    const publicQuizPage = readRepoFile("src/app/quiz/[slug]/page.tsx");
    const quizTaker = readRepoFile("src/components/education/QuizTaker.tsx");

    expect(publicQuizPage).toContain("public_signup_gate");
    expect(publicQuizPage).toContain("PROFESSIONAL_GATED_QUIZ_SLUG");
    expect(quizTaker).toContain("requiresSignup");
    expect(quizTaker).toContain("sessionStorage");
    expect(quizTaker).toContain("/academy/signup?next=");
  });
});
