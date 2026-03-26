import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("local hardcoded image references", () => {
  it("uses local project assets for the default photography hero", () => {
    const visualAssets = readRepoFile("src/lib/visualAssets.ts");

    expect(visualAssets).toContain('"/images/hero-placeholder.png"');
  });

  it("uses the local uploaded hero image on the video catalog page", () => {
    const videoCatalogPage = readRepoFile("src/app/education/videos/page.tsx");

    expect(videoCatalogPage).toContain('src="/images/videos-hero-placeholder.png"');
  });

  it("uses the consultation local asset as the promo fallback", () => {
    const promoSection = readRepoFile("src/components/sections/FreeAcademyVideoPromoSection.tsx");

    expect(promoSection).toContain("lead.heroUrl ?? photography.consultation.src");
  });
});
