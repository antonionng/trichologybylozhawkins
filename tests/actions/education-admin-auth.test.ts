import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserOrRedirectMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: requireUserOrRedirectMock,
  getCurrentSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/server/modules/education/service", () => ({
  getCourseCatalog: vi.fn(),
  getAdminCourseCatalog: vi.fn(),
  getVideoCatalog: vi.fn(),
  getAdminVideoCatalog: vi.fn(),
  getEducationStats: vi.fn(),
  getRecentEnrollments: vi.fn(),
  getCourse: vi.fn(),
  getVideoProduct: vi.fn(),
  upsertCourse: vi.fn(),
  upsertVideoProduct: vi.fn(),
  deleteCourse: vi.fn(),
  deleteVideoProduct: vi.fn(),
  upsertCourseModule: vi.fn(),
  deleteCourseModule: vi.fn(),
  upsertCourseLesson: vi.fn(),
  deleteCourseLesson: vi.fn(),
  upsertCoursePrice: vi.fn(),
  upsertVideoProductPrice: vi.fn(),
  upsertCourseSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  createBundleCheckoutSession: vi.fn(),
  getBundleBySlug: vi.fn(),
}));

vi.mock("@/server/modules/education/workshops", () => ({
  getWorkshopCatalog: vi.fn(),
  getAdminWorkshopCatalog: vi.fn(),
  getWorkshopBySlug: vi.fn(),
  getWorkshop: vi.fn(),
  upsertWorkshop: vi.fn(),
  deleteWorkshop: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    quiz: { findMany: vi.fn() },
    courseModule: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    contact: { upsert: vi.fn() },
    enrollment: { findFirst: vi.fn(), create: vi.fn() },
    videoProduct: { findUnique: vi.fn() },
    videoAccess: { findFirst: vi.fn(), create: vi.fn() },
    lessonProgress: { upsert: vi.fn() },
    videoWatch: { upsert: vi.fn() },
  },
}));

const adminOnlyCases = [
  { label: "getEducationStats", call: async () => (await import("@/app/actions/education")).getEducationStats() },
  { label: "getRecentEnrollments", call: async () => (await import("@/app/actions/education")).getRecentEnrollments() },
  { label: "getCourse", call: async () => (await import("@/app/actions/education")).getCourse("course_1") },
  { label: "getVideoProduct", call: async () => (await import("@/app/actions/education")).getVideoProduct("video_1") },
  { label: "upsertCourse", call: async () => (await import("@/app/actions/education")).upsertCourse({ title: "Course" } as any) },
  { label: "deleteCourse", call: async () => (await import("@/app/actions/education")).deleteCourse("course_1") },
  { label: "upsertModule", call: async () => (await import("@/app/actions/education")).upsertModule({ title: "Module" } as any) },
  { label: "deleteModule", call: async () => (await import("@/app/actions/education")).deleteModule("module_1", "course_1") },
  { label: "upsertLesson", call: async () => (await import("@/app/actions/education")).upsertLesson({ title: "Lesson" } as any) },
  { label: "deleteLesson", call: async () => (await import("@/app/actions/education")).deleteLesson("lesson_1", "course_1") },
  { label: "upsertPrice", call: async () => (await import("@/app/actions/education")).upsertPrice({ amount: 99 } as any) },
  { label: "upsertSession", call: async () => (await import("@/app/actions/education")).upsertSession({ title: "Session" } as any) },
  { label: "getWorkshopById", call: async () => (await import("@/app/actions/education")).getWorkshopById("workshop_1") },
  { label: "upsertWorkshop", call: async () => (await import("@/app/actions/education")).upsertWorkshop({ title: "Workshop" } as any) },
];

describe("education admin action guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it.each(adminOnlyCases)("requires admin for $label", async ({ call }) => {
    requireUserOrRedirectMock.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(call()).rejects.toThrow("Forbidden");
    expect(requireUserOrRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: "ADMIN" }),
    );
  });
});
