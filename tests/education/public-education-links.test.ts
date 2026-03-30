import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("public education purchase links", () => {
  it("routes course detail CTAs through education checkout instead of direct academy access", () => {
    const courseDetailPage = readRepoFile("src/app/education/[slug]/page.tsx");

    expect(courseDetailPage).toContain("/education/checkout/");
    expect(courseDetailPage).not.toContain("href={`/academy/${course.id}`}");
  });

  it("routes academy browse cards back through public education pages", () => {
    const academyTabs = readRepoFile("src/components/academy/AcademyTabs.tsx");

    expect(academyTabs).toContain("href={`/education/${course.slug}`}");
    expect(academyTabs).not.toContain("href={`/education/videos/${video.slug}`}");
    expect(academyTabs).toContain("href={`/academy/videos/${video.id}`}");
    expect(academyTabs).toContain("selectedLockedVideo");
    expect(academyTabs).toContain("VideoPurchaseButton");
    expect(academyTabs).toContain("View course");
    expect(academyTabs).toContain("View video");
  });

  it("does not use the direct video enroll shortcut on the public video page", () => {
    const videoDetailPage = readRepoFile("src/app/education/videos/[slug]/page.tsx");

    expect(videoDetailPage).not.toContain("VideoEnrollButton");
  });

  it("still lets logged-in learners claim the configured free signup lesson", () => {
    const videoDetailPage = readRepoFile("src/app/education/videos/[slug]/page.tsx");

    expect(videoDetailPage).toContain("Unlock free lesson");
    expect(videoDetailPage).toContain("enrollInVideo(currentVideo.dbId)");
  });
});
