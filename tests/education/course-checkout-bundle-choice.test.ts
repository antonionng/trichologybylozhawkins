import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("course checkout bundle choice", () => {
  it("keeps signed-in learners on the course checkout page with a payment CTA", () => {
    const checkoutPage = readRepoFile("src/app/education/checkout/[slug]/page.tsx");

    expect(checkoutPage).not.toContain("redirect(`/education/${params.slug}`)");
    expect(checkoutPage).toContain("PurchaseButton");
  });

  it("uses a shared bundle offer helper for the eligible course pair", () => {
    const helperPath = path.join(repoRoot, "src/lib/educationBundles.ts");

    expect(fs.existsSync(helperPath)).toBe(true);

    const helper = readRepoFile("src/lib/educationBundles.ts");
    expect(helper).toContain("trichocare-phase-1");
    expect(helper).toContain("trichology-clinical-practice");
    expect(helper).toContain("phase-1-clinical-practice");
  });

  it("offers both single-course and bundle paths on eligible course pages and checkout pages", () => {
    const coursePage = readRepoFile("src/app/education/[slug]/page.tsx");
    const checkoutPage = readRepoFile("src/app/education/checkout/[slug]/page.tsx");
    const choiceComponent = readRepoFile("src/components/education/CourseBundleChoice.tsx");

    expect(coursePage).toContain("CourseBundleChoice");
    expect(checkoutPage).toContain("CourseBundleChoice");
    expect(choiceComponent).toContain("Choose your learning path");
    expect(choiceComponent).toContain("Buy this course only");
    expect(choiceComponent).toContain("Get the full bundle");
  });
});
