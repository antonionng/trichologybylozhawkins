import { rateLimit } from "@/server/security/rateLimit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const result = rateLimit({ key: "test", limit: 2, windowMs: 1000 });
    expect(result).toBe(true);
  });

  it("blocks requests when limit exceeded", () => {
    const key = "burst";
    expect(rateLimit({ key, limit: 1, windowMs: 1000 })).toBe(true);
    expect(rateLimit({ key, limit: 1, windowMs: 1000 })).toBe(false);
  });
});

