import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const generateDraftMock = vi.fn();
const generateHeroMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/modules/ai/knowledgeHubArticle", () => ({
  generateKnowledgeHubArticleDraft: generateDraftMock,
  generateKnowledgeHubHeroImage: generateHeroMock,
}));

describe("knowledge-hub-article AI route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ user: { role: "ADMIN" } });
  });

  it("returns a draft for admins", async () => {
    generateDraftMock.mockResolvedValueOnce({
      title: "Test Article",
      slug: "test-article",
      summary: "Summary",
      readTime: "6 min read",
      sections: [{ type: "paragraph", text: "Hello" }],
    });

    const { POST } = await import("@/app/api/ai/knowledge-hub-article/route");
    const response = await POST(
      new Request("http://localhost/api/ai/knowledge-hub-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "draft",
          category: "Hair Loss",
          title: "Seed",
        }),
      }),
    );

    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(generateDraftMock).toHaveBeenCalledWith({
      category: "Hair Loss",
      title: "Seed",
    });
    await expect(response.json()).resolves.toEqual({
      ok: true,
      draft: {
        title: "Test Article",
        slug: "test-article",
        summary: "Summary",
        readTime: "6 min read",
        sections: [{ type: "paragraph", text: "Hello" }],
      },
    });
  });

  it("returns a hero URL for admins", async () => {
    generateHeroMock.mockResolvedValueOnce({
      heroUrl: "https://cdn.example/hero.png",
      imagePrompt: "A calm clinical setting",
    });

    const { POST } = await import("@/app/api/ai/knowledge-hub-article/route");
    const response = await POST(
      new Request("http://localhost/api/ai/knowledge-hub-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "hero",
          title: "Scalp health basics",
          category: "Scalp Health",
        }),
      }),
    );

    expect(generateHeroMock).toHaveBeenCalledWith({
      title: "Scalp health basics",
      category: "Scalp Health",
    });
    await expect(response.json()).resolves.toEqual({
      ok: true,
      heroUrl: "https://cdn.example/hero.png",
      imagePrompt: "A calm clinical setting",
    });
  });

  it("returns 403 when forbidden", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("Forbidden"));

    const { POST } = await import("@/app/api/ai/knowledge-hub-article/route");
    const response = await POST(
      new Request("http://localhost/api/ai/knowledge-hub-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "draft", category: "Hair Loss" }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
