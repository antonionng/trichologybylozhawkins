import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { normalizeArticleSections } from "@/server/modules/ai/knowledgeHubArticle";

describe("normalizeArticleSections", () => {
  it("maps mixed section shapes", () => {
    const sections = normalizeArticleSections([
      { type: "heading", text: "Intro", items: [] },
      { type: "paragraph", text: "Body", items: [] },
      { type: "list", text: "", items: ["a", "b"] },
      { type: "unknown", text: "x", items: [] },
    ]);

    expect(sections).toEqual([
      { type: "heading", text: "Intro" },
      { type: "paragraph", text: "Body" },
      { type: "list", items: ["a", "b"] },
    ]);
  });

  it("falls back to empty paragraph when nothing valid", () => {
    expect(normalizeArticleSections([])).toEqual([{ type: "paragraph", text: "" }]);
  });
});
