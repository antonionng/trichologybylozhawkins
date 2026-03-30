import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const publicRoot = path.join(process.cwd(), "public");
const appRoot = path.join(process.cwd(), "src", "app");

describe("public metadata assets", () => {
  it("ships the app favicon plus public touch and social preview assets", () => {
    expect(fs.existsSync(path.join(appRoot, "favicon.ico"))).toBe(true);
    expect(fs.existsSync(path.join(publicRoot, "favicon.ico"))).toBe(false);

    ["apple-touch-icon.png", "og-image.png"].forEach((asset) => {
      expect(fs.existsSync(path.join(publicRoot, asset))).toBe(true);
    });
  });
});
