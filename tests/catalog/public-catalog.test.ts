import { describe, expect, it } from "vitest";
import {
  excludeTestCatalogItems,
  isTestCatalogItem,
  publicCourseCatalogWhere,
  publicShopProductCatalogWhere,
} from "@/lib/publicCatalog";

describe("public catalog visibility", () => {
  it("treats TEST Live titles, slugs, and isTest meta as hidden catalog items", () => {
    expect(isTestCatalogItem({ title: "TEST Live Course A", slug: "trichocare-phase-1" })).toBe(true);
    expect(isTestCatalogItem({ name: "TEST Live Product B", slug: "primer" })).toBe(true);
    expect(isTestCatalogItem({ title: "Salon Trichology Essentials", slug: "test-live-course-a" })).toBe(true);
    expect(isTestCatalogItem({ title: "Primer", slug: "primer", meta: { isTest: true } })).toBe(true);
    expect(isTestCatalogItem({ title: "Postpartum Hair Loss", slug: "postpartum-hair-loss" })).toBe(false);
  });

  it("filters TEST Live rows out of public showcase lists", () => {
    const visible = excludeTestCatalogItems([
      { title: "Postpartum Hair Loss", slug: "postpartum-hair-loss" },
      { title: "TEST Live Course A", slug: "test-live-course-a" },
      { name: "TEST Live Product A", slug: "test-live-product-a" },
      { name: "Primer", slug: "primer" },
    ]);

    expect(visible.map((item) => item.slug)).toEqual(["postpartum-hair-loss", "primer"]);
  });

  it("builds Prisma filters that keep academy quizzes and TEST Live SKUs off public lists", () => {
    expect(publicCourseCatalogWhere()).toMatchObject({
      status: "PUBLISHED",
    });
    expect(JSON.stringify(publicCourseCatalogWhere())).toContain("test-live-");
    expect(JSON.stringify(publicCourseCatalogWhere())).toContain("TEST Live");
    expect(JSON.stringify(publicShopProductCatalogWhere())).toContain("TEST Live");
  });
});
