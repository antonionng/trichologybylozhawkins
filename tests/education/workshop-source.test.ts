import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("education workshop source of truth", () => {
  it("prefers admin-managed workshop cards over static fallback cards", () => {
    const educationPage = readRepoFile("src/app/education/page.tsx");

    expect(educationPage).toContain("export function selectFeaturedWorkshops(");
    expect(educationPage).toContain("return dbWorkshops.length > 0 ? dbWorkshops : fallbackWorkshops;");
  });
});
