import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const appPagePath = path.join(process.cwd(), "src/app/page.tsx");

describe("homepage showcase query", () => {
  it("does not include scalar meta inside the Prisma course include block", () => {
    const appPage = fs.readFileSync(appPagePath, "utf8");

    expect(appPage).not.toContain("meta: true,");
  });
});
