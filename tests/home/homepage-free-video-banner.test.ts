import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("HomepageFreeVideoBanner quiz funnel", () => {
  it("routes public quiz traffic straight into the scalp quiz without academy signup", () => {
    const banner = readRepoFile("src/components/sections/HomepageFreeVideoBanner.tsx");

    expect(banner).toContain('lead.kind === "QUIZ"');
    expect(banner).toContain('`/quiz/${lead.slug}`');
    expect(banner).toContain('? "Start scalp quiz" : "Create free academy account"');
    expect(banner).toContain('Email unlocks your guidance summary');
  });
});
