import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const requireUserOrRedirectMock = vi.fn();
const listAccessibleCoursesMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/education/enquiries",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: requireUserOrRedirectMock,
}));

vi.mock("@/server/modules/education/access", () => ({
  listAccessibleCourses: listAccessibleCoursesMock,
}));

vi.mock("@/components/admin/AdminMetric", () => ({
  AdminMetric: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("@/components/admin/Panel", () => ({
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/admin/AdminButton", () => ({
  AdminButton: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/admin/AdminBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("@/components/dashboard/LearnerDashboard", () => ({
  LearnerDashboard: () => <div>Learner Dashboard</div>,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    contact: { count: vi.fn().mockResolvedValue(10) },
    deal: { count: vi.fn().mockResolvedValue(5) },
    enrollment: {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([]),
    },
    task: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
    },
    dealPipeline: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    courseEnquiry: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "eq1",
          name: "Jane Doe",
          email: "jane@example.com",
          createdAt: new Date("2026-03-18T10:00:00Z"),
          repliedAt: null,
          course: { title: "Scalp Science" },
        },
      ]),
    },
  },
}));

describe("admin dead-end actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links dashboard enquiry actions to the dedicated enquiries page", async () => {
    requireUserOrRedirectMock.mockResolvedValueOnce({
      user: { id: "admin_1", role: "ADMIN", email: "admin@example.com" },
    });
    const { default: DashboardHome } = await import("@/app/dashboard/page");

    const html = renderToStaticMarkup(await DashboardHome());

    expect(html).toContain("/dashboard/education/enquiries");
    expect(html).not.toContain("/dashboard/education?tab=enquiries");
  });

  it("builds a contact export URL from selected IDs", async () => {
    const { buildContactExportHref } = await import("@/components/dashboard/crm/ContactsIndexClient");

    expect(buildContactExportHref(["c1", "c2"])).toBe("/api/crm/contacts/export?ids=c1&ids=c2");
  });

  it("shows an enquiries tab in the education sub-nav", async () => {
    const { EducationSubNav } = await import("@/components/dashboard/education/EducationSubNav");

    const html = renderToStaticMarkup(<EducationSubNav />);

    expect(html).toContain("/dashboard/education/enquiries");
    expect(html).toContain("Enquiries");
  });

  it("throws when the workshop AI request fails", async () => {
    const { assertSuccessfulAiWorkshopBuild } = await import("@/app/dashboard/education/workshops/new/page");

    await expect(
      assertSuccessfulAiWorkshopBuild({
        ok: false,
        status: 500,
        json: async () => ({ error: "Queue unavailable" }),
      } as Response),
    ).rejects.toThrow("Queue unavailable");
  });
});
