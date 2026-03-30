import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("video seed data", () => {
  it("marks the menopause video as the free signup lesson in fresh environments", () => {
    const seedFile = readRepoFile("prisma/seed.ts");

    expect(seedFile).toContain('slug: "menopause-hair-loss"');
    expect(seedFile).toContain("isFreeOnSignup: true");
    expect(seedFile).toContain("update: {");
    expect(seedFile).toContain("create: {");
  });
});
