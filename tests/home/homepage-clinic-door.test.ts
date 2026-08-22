import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("homepage clinic door", () => {
  it("keeps the homepage education-first and adds a consumer clinic door", () => {
    const hero = readRepoFile("src/components/sections/HomeHero.tsx");
    const door = readRepoFile("src/components/sections/HomepageClinicDoor.tsx");
    const home = readRepoFile("src/app/page.tsx");

    expect(hero).toContain("Clinical trichology education");
    expect(hero).toContain("Explore Training");
    expect(hero).not.toContain("FEATURED_PUBLIC_QUIZ_HREF");
    expect(door).toContain("Not a hair professional?");
    expect(door).toContain("href=\"/clinic\"");
    expect(door).toContain("no online calendar");
    expect(home).toContain("<HomeHero />");
    expect(home).toContain("<HomepageClinicDoor />");
    expect(home).toContain("isClinicMarketingHost");
    expect(home).toContain("ClinicPageView");
    expect(home).not.toContain("ClinicHostBanner");
  });
});
