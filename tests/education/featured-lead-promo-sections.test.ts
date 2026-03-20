import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("featured lead promo sections", () => {
  it("renders quiz-aware promo copy on the homepage and education pages", () => {
    const homeBanner = readRepoFile("src/components/sections/HomepageFreeVideoBanner.tsx");
    const promoSection = readRepoFile("src/components/sections/FreeAcademyVideoPromoSection.tsx");
    const educationPage = readRepoFile("src/app/education/page.tsx");
    const videoCatalogPage = readRepoFile("src/app/education/videos/page.tsx");

    expect(homeBanner).toContain('lead.kind === "QUIZ"');
    expect(homeBanner).toContain("Start quiz");
    expect(homeBanner).toContain("Email unlocks your guidance summary");
    expect(promoSection).toContain('lead.kind === "QUIZ"');
    expect(promoSection).toContain("Unlock full quiz results");
    expect(educationPage).toContain("getCurrentFeaturedLeadItem");
    expect(videoCatalogPage).toContain("getCurrentFeaturedLeadItem");
  });

  it("falls back to the consultation image when a featured lead has no own image", () => {
    const homeBanner = readRepoFile("src/components/sections/HomepageFreeVideoBanner.tsx");
    const promoSection = readRepoFile("src/components/sections/FreeAcademyVideoPromoSection.tsx");

    expect(homeBanner).toContain("photography.consultation.src");
    expect(homeBanner).toContain("lead.heroUrl ?? photography.consultation.src");
    expect(promoSection).toContain("photography.consultation.src");
    expect(promoSection).toContain("lead.heroUrl ?? photography.consultation.src");
  });
});
