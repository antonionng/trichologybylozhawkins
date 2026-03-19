import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const findManyMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    contact: {
      findMany: findManyMock,
    },
  },
}));

describe("GET /api/crm/contacts/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin before exporting", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("Forbidden"));
    const { GET } = await import("@/app/api/crm/contacts/export/route");

    const response = await GET(
      new Request("http://localhost/api/crm/contacts/export?ids=c1"),
    );

    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(response.status).toBe(400);
  });

  it("returns selected contacts as csv", async () => {
    requireUserMock.mockResolvedValueOnce({ user: { role: "ADMIN" } });
    findManyMock.mockResolvedValueOnce([
      {
        id: "c1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phone: "123",
        lifecycleStage: "LEAD",
        company: { name: "Analytical Engines" },
        deals: [{ id: "d1" }, { id: "d2" }],
        updatedAt: new Date("2026-03-18T12:00:00Z"),
      },
    ]);
    const { GET } = await import("@/app/api/crm/contacts/export/route");

    const response = await GET(
      new Request("http://localhost/api/crm/contacts/export?ids=c1"),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["c1"] } },
      }),
    );
    expect(body).toContain("firstName,lastName,email,phone,lifecycleStage,company,deals,updatedAt");
    expect(body).toContain("Ada,Lovelace,ada@example.com,123,LEAD,Analytical Engines,2,2026-03-18T12:00:00.000Z");
  });
});
