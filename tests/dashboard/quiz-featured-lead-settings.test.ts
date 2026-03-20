import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("quiz editor featured lead settings", () => {
  it("includes public quiz controls and a featured lead toggle", () => {
    const quizEditor = readRepoFile("src/components/dashboard/education/QuizEditor.tsx");

    expect(quizEditor).toContain("isFeaturedLead");
    expect(quizEditor).toContain("isPublic");
    expect(quizEditor).toContain("slug");
    expect(quizEditor).toContain("Featured lead quiz");
  });
});
