import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("academy featured free video promotion", () => {
  it("passes the featured free video id into the academy tabs", () => {
    const academyPage = readRepoFile("src/app/academy/page.tsx");

    expect(academyPage).toContain("getCurrentFeaturedLeadItem");
    expect(academyPage).toContain("featuredFreeVideoId");
    expect(academyPage).toContain("featuredFreeVideoId={featuredFreeVideoId}");
  });

  it("renders a featured free lesson card and modal-ready locked video state in the academy videos tab", () => {
    const academyTabs = readRepoFile("src/components/academy/AcademyTabs.tsx");

    expect(academyTabs).toContain("featuredFreeVideoId?: string | null");
    expect(academyTabs).toContain("Featured free lesson");
    expect(academyTabs).toContain("Watch free lesson");
    expect(academyTabs).toContain("Free with academy signup");
    expect(academyTabs).toContain("myVideos.find");
    expect(academyTabs).toContain("browseVideos.find");
    expect(academyTabs).toContain("selectedLockedVideo");
    expect(academyTabs).toContain("setSelectedLockedVideo");
    expect(academyTabs).toContain("VideoPurchaseButton");
    expect(academyTabs).toContain("href={`/academy/videos/${video.id}`}");
  });
});
