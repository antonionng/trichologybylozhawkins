import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("content-factory blog helpers", () => {
  it("merges CMS entries and published content slots into the blog index", async () => {
    const { mergeBlogHighlights } = await import("@/app/blog/page");

    const result = mergeBlogHighlights(
      [
        {
          id: "entry_1",
          title: "CMS Entry",
          summary: "CMS summary",
          slug: "cms-entry",
          publishedAt: new Date("2026-03-02T10:00:00Z"),
          createdAt: new Date("2026-03-01T10:00:00Z"),
          meta: { category: "Article" },
        },
      ] as any,
      [
        {
          id: "slot_1",
          title: "Factory Slot",
          brief: "Factory summary",
          publishedAt: new Date("2026-03-03T10:00:00Z"),
          createdAt: new Date("2026-03-01T10:00:00Z"),
          metadata: { slug: "factory-slot", category: "Case Study" },
        },
      ] as any,
    );

    expect(result.map((item) => item.slug)).toEqual(["factory-slot", "cms-entry"]);
  });

  it("maps a published content slot into article sections", async () => {
    const { mapContentSlotToArticle } = await import("@/app/blog/[slug]/page");

    const article = mapContentSlotToArticle({
      id: "slot_1",
      title: "Factory Slot",
      brief: "Short intro",
      createdAt: new Date("2026-03-01T10:00:00Z"),
      publishedAt: new Date("2026-03-03T10:00:00Z"),
      metadata: { slug: "factory-slot", category: "Case Study", readTime: "4 min read" },
      assets: [
        {
          type: "COPY",
          mediaUrl: null,
          variants: [
            {
              copy: "First paragraph.\n\nSecond paragraph.",
            },
          ],
        },
      ],
    } as any);

    expect(article).toMatchObject({
      title: "Factory Slot",
      category: "Case Study",
      published: "2026-03-03",
      readTime: "4 min read",
    });
    expect(article?.content).toEqual([
      { type: "paragraph", text: "First paragraph." },
      { type: "paragraph", text: "Second paragraph." },
    ]);
  });

  it("sends content-factory articles back to the selected slot in admin", async () => {
    const { getKnowledgeHubEditHref } = await import("@/app/dashboard/knowledge-hub/page");

    expect(
      getKnowledgeHubEditHref({
        id: "slot_1",
        source: "content-factory",
      } as any),
    ).toBe("/dashboard/content?slotId=slot_1");
  });
});
