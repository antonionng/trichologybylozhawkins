import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  services,
  videoLessons,
  VIDEO_HERO_PLACEHOLDER_BY_SLUG,
  VIDEO_HERO_PLACEHOLDER_DEFAULT,
} from "@/lib/content";
import { photography } from "@/lib/visualAssets";

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, "public");

function assertAssetExists(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    expect(src).toMatch(/^https?:\/\//);
    return;
  }

  const relativePath = src.startsWith("/") ? src.slice(1) : src;
  expect(fs.existsSync(path.join(publicRoot, relativePath))).toBe(true);
}

describe("content asset paths", () => {
  it("uses valid image sources for photography entries", () => {
    Object.values(photography).forEach((asset) => {
      assertAssetExists(asset.src);
    });
  });

  it("uses valid image sources for content cards", () => {
    videoLessons.forEach((lesson) => assertAssetExists(lesson.image.src));
    services.forEach((service) => assertAssetExists(service.image.src));
  });

  it("uses valid on-disk paths for video hero fallbacks", () => {
    Object.values(VIDEO_HERO_PLACEHOLDER_BY_SLUG).forEach((src) => assertAssetExists(src));
    assertAssetExists(VIDEO_HERO_PLACEHOLDER_DEFAULT);
  });
});
