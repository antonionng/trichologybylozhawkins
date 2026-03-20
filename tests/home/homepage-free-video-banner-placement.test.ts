import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("homepage featured lead banner placement", () => {
  it("loads the current featured lead item and renders the homepage banner after the hero", () => {
    const appPage = readRepoFile("src/app/page.tsx");

    expect(appPage).toContain("getCurrentFeaturedLeadItem");
    expect(appPage).toContain("HomepageFreeVideoBanner");
    expect(appPage).toContain("<HomeHero />");
    expect(appPage).toContain("<HomepageFreeVideoBanner");
  });

  it("keeps the homepage resilient when the free-video lookup fails", () => {
    const appPage = readRepoFile("src/app/page.tsx");

    expect(appPage).toContain("async function getHomepageFreeVideo() {\n  try {");
    expect(appPage).toContain("} catch {\n    return null;");
  });
});
