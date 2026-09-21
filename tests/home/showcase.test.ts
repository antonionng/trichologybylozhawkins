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

  it("hides TEST Live catalog rows from homepage showcase lists", async () => {
    const result = await loadHomeShowcaseData({
      loadVideos: async () => [
        {
          id: "v1",
          slug: "postpartum-hair-loss",
          title: "Postpartum Hair Loss",
          subtitle: null,
          category: "Video",
          durationMinutes: 25,
          publicContent: {},
          meta: {},
          pricing: [{ amount: 29 }],
          heroMedia: null,
        },
        {
          id: "v2",
          slug: "test-live-video-a",
          title: "TEST Live Course A",
          subtitle: null,
          category: "Video",
          durationMinutes: 10,
          publicContent: {},
          meta: {},
          pricing: [{ amount: 1 }],
          heroMedia: null,
        },
      ],
      loadCourses: async () => [
        {
          id: "c1",
          slug: "test-live-course-a",
          title: "TEST Live Course A",
          subtitle: null,
          level: "GENERAL",
          durationMinutes: 10,
          meta: {},
          pricing: [{ amount: 1 }],
          _count: { modules: 1 },
          heroMedia: null,
        },
      ],
      loadProducts: async () => [
        {
          id: "p1",
          slug: "test-live-product-a",
          name: "TEST Live Product A",
          shortDescription: "Test",
          price: 1,
          imageUrl: "https://example.com/test.jpg",
        },
        {
          id: "p2",
          slug: "primer",
          name: "Primer",
          shortDescription: "Real product",
          price: 18,
          imageUrl: "https://example.com/primer.jpg",
        },
      ],
      signUrl: async (path: string) => `https://signed.example/${path}`,
      videoFallbackBySlug: {},
      videoFallbackDefault: "https://example.com/video-default.jpg",
    });

    expect(result.videos.map((item) => item.slug)).toEqual(["postpartum-hair-loss"]);
    expect(result.courses).toEqual([]);
    expect(result.products.map((item) => item.slug)).toEqual(["primer"]);
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

