import { describe, expect, it, vi } from "vitest";
import { loadHomeShowcaseData } from "@/server/modules/home/showcase";

describe("loadHomeShowcaseData", () => {
  it("still returns course and video rows when shop products fail to load", async () => {
    const signUrl = vi.fn(async (path: string) => `https://signed.example/${path}`);

    const result = await loadHomeShowcaseData({
      loadVideos: async () => [
        {
          id: "v1",
          slug: "video-1",
          title: "Video 1",
          subtitle: "subtitle",
          category: "Category",
          durationMinutes: 30,
          publicContent: {},
          meta: {},
          pricing: [{ amount: 29 }],
          heroMedia: null,
        },
      ],
      loadCourses: async () => [
        {
          id: "c1",
          slug: "course-1",
          title: "Course 1",
          subtitle: "course subtitle",
          level: "BEGINNER",
          durationMinutes: 60,
          meta: { heroImage: "https://example.com/course.jpg" },
          pricing: [{ amount: 99 }],
          _count: { modules: 4 },
          heroMedia: null,
        },
      ],
      loadProducts: async () => {
        throw new Error("ShopProduct table missing");
      },
      signUrl,
      videoFallbackBySlug: {},
      videoFallbackDefault: "https://example.com/video-default.jpg",
      productFallbacks: [
        {
          id: "fallback-1",
          slug: "fallback-product",
          name: "Fallback Product",
          shortDescription: "Fallback description",
          price: 19,
          imageUrl: "https://example.com/fallback.jpg",
        },
      ],
    });

    expect(result.videos).toHaveLength(1);
    expect(result.courses).toHaveLength(1);
    expect(result.products).toEqual([
      {
        id: "fallback-1",
        slug: "fallback-product",
        name: "Fallback Product",
        shortDescription: "Fallback description",
        price: 19,
        imageUrl: "https://example.com/fallback.jpg",
      },
    ]);
    expect(result.courses[0]?.heroUrl).toBe("https://example.com/course.jpg");
  });

  it("reports which showcase source failed to load", async () => {
    const onLoadError = vi.fn();

    await loadHomeShowcaseData({
      loadVideos: async () => [],
      loadCourses: async () => [],
      loadProducts: async () => {
        throw new Error("ShopProduct table missing");
      },
      signUrl: async (path: string) => `https://signed.example/${path}`,
      videoFallbackBySlug: {},
      videoFallbackDefault: "https://example.com/video-default.jpg",
      productFallbacks: [],
      onLoadError,
    });

    expect(onLoadError).toHaveBeenCalledTimes(1);
    expect(onLoadError).toHaveBeenCalledWith(
      "products",
      expect.objectContaining({ message: "ShopProduct table missing" }),
    );
  });
});

