import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserOrRedirectMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: requireUserOrRedirectMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    courseEnquiry: { findMany: vi.fn() },
    collection: { findUnique: vi.fn() },
    entry: { findMany: vi.fn() },
    contentSlot: { findMany: vi.fn() },
    contentPlan: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

describe("admin dashboard page auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("guards the education enquiries page", async () => {
    requireUserOrRedirectMock.mockRejectedValueOnce(new Error("Forbidden"));
    const { default: EducationEnquiriesPage } = await import("@/app/dashboard/education/enquiries/page");

    await expect(EducationEnquiriesPage()).rejects.toThrow("Forbidden");
    expect(requireUserOrRedirectMock).toHaveBeenCalledWith({
      role: "ADMIN",
      next: "/dashboard/education/enquiries",
    });
  });

  it("guards the knowledge hub page", async () => {
    requireUserOrRedirectMock.mockRejectedValueOnce(new Error("Forbidden"));
    const { default: KnowledgeHubList } = await import("@/app/dashboard/knowledge-hub/page");

    await expect(KnowledgeHubList()).rejects.toThrow("Forbidden");
    expect(requireUserOrRedirectMock).toHaveBeenCalledWith({
      role: "ADMIN",
      next: "/dashboard/knowledge-hub",
    });
  });

  it("guards the content dashboard page", async () => {
    requireUserOrRedirectMock.mockRejectedValueOnce(new Error("Forbidden"));
    const { default: ContentDashboardPage } = await import("@/app/dashboard/content/page");

    await expect(ContentDashboardPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("Forbidden");
    expect(requireUserOrRedirectMock).toHaveBeenCalledWith({
      role: "ADMIN",
      next: "/dashboard/content",
    });
  });
});
