import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const publicRoot = path.join(process.cwd(), "public");

describe("public metadata assets", () => {
  it("ships the favicon and social preview placeholders", () => {
    const requiredAssets = [
      "favicon.ico",
      "apple-touch-icon.png",
      "og-image.png",
    ];

    requiredAssets.forEach((asset) => {
      expect(fs.existsSync(path.join(publicRoot, asset))).toBe(true);
    });
  });
});
