import { describe, expect, it } from "vitest";
import { parseEmailList } from "@/server/schema/env";

describe("parseEmailList", () => {
  it("splits, trims, and de-duplicates comma separated emails", () => {
    expect(
      parseEmailList("ops@example.com, team@example.com, ops@example.com, , shop@example.com ")
    ).toEqual(["ops@example.com", "team@example.com", "shop@example.com"]);
  });

  it("returns an empty list when the env value is missing", () => {
    expect(parseEmailList(undefined)).toEqual([]);
  });
});
