import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/server/storage/supabase", () => ({
  createSignedDownloadUrl: vi.fn(async () => "https://signed.example/hero.jpg"),
}));

import { resolveQuizCardImageUrl } from "@/server/modules/education/quizHero";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

describe("resolveQuizCardImageUrl", () => {
  it("prefers signed hero media path over external URL", async () => {
    const url = await resolveQuizCardImageUrl({
      heroMedia: { path: "quiz/x/hero.jpg" },
      cardImageUrl: "https://images.unsplash.com/photo-1",
    });
    expect(url).toBe("https://signed.example/hero.jpg");
    expect(createSignedDownloadUrl).toHaveBeenCalledWith("quiz/x/hero.jpg", 600);
  });

  it("falls back to cardImageUrl when no hero media", async () => {
    vi.mocked(createSignedDownloadUrl).mockRejectedValueOnce(new Error("missing"));
    const url = await resolveQuizCardImageUrl({
      heroMedia: { path: "bad" },
      cardImageUrl: "https://images.unsplash.com/photo-2",
    });
    expect(url).toBe("https://images.unsplash.com/photo-2");
  });

  it("returns null when nothing usable", async () => {
    const url = await resolveQuizCardImageUrl({});
    expect(url).toBeNull();
  });
});
