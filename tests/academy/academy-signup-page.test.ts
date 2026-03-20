import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("academy signup page", () => {
  it("posts to the signup API and positions the offer as a free academy account", () => {
    const signupClient = readRepoFile("src/app/academy/signup/AcademySignupClient.tsx");

    expect(signupClient).toContain('fetch("/api/auth/signup"');
    expect(signupClient).toContain("Create your free academy account");
    expect(signupClient).toContain("freeVideoTitle");
    expect(signupClient).not.toContain("Menopause & Hair Loss lesson");
    expect(signupClient).toContain('router.replace(nextPath || json.academyPath || "/academy")');
  });
});
