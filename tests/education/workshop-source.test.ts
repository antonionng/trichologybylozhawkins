import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("education workshop source of truth", () => {
  it("prefers admin-managed workshop cards over static fallback cards", async () => {
    const { selectFeaturedWorkshops } = await import("@/app/education/page");

    const selected = selectFeaturedWorkshops(
      [
        {
          id: "db_1",
          slug: "db-workshop",
          title: "DB Workshop",
        },
      ] as any,
      [
        {
          id: "static_1",
          slug: "static-workshop",
          title: "Static Workshop",
        },
      ] as any,
    );

    expect(selected).toHaveLength(1);
    expect(selected[0]?.slug).toBe("db-workshop");
  });
});
