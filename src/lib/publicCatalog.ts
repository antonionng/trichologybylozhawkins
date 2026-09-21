export const TEST_LIVE_CATALOG_TITLES = [
  "TEST Live Course A",
  "TEST Live Course B",
  "TEST Live Product A",
  "TEST Live Product B",
] as const;

export const TEST_LIVE_CATALOG_SLUGS = [
  "test-live-course-a",
  "test-live-course-b",
  "test-live-product-a",
  "test-live-product-b",
] as const;

export const TEST_CATALOG_SLUG_PREFIX = "test-live-";
export const TEST_CATALOG_TITLE_PREFIX = "TEST Live";

type CatalogIdentity = {
  slug?: string | null;
  title?: string | null;
  name?: string | null;
  meta?: unknown;
};

function readMetaFlag(meta: unknown, key: string) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return false;
  }
  return (meta as Record<string, unknown>)[key] === true;
}

export function isTestCatalogItem(item: CatalogIdentity) {
  const slug = (item.slug ?? "").trim().toLowerCase();
  const title = (item.title ?? item.name ?? "").trim();

  if (readMetaFlag(item.meta, "isTest")) {
    return true;
  }

  if (slug.startsWith(TEST_CATALOG_SLUG_PREFIX)) {
    return true;
  }

  if (TEST_LIVE_CATALOG_SLUGS.includes(slug as (typeof TEST_LIVE_CATALOG_SLUGS)[number])) {
    return true;
  }

  return /^test live\b/i.test(title);
}

export function excludeTestCatalogItems<T extends CatalogIdentity>(items: T[]) {
  return items.filter((item) => !isTestCatalogItem(item));
}

export function publicCatalogStatusWhere() {
  return { status: "PUBLISHED" as const };
}

export function publicCourseCatalogWhere(extra: Record<string, unknown> = {}) {
  return {
    status: "PUBLISHED" as const,
    AND: [
      { slug: { not: "academy-quizzes" } },
      { NOT: { slug: { startsWith: TEST_CATALOG_SLUG_PREFIX } } },
      { NOT: { title: { startsWith: TEST_CATALOG_TITLE_PREFIX, mode: "insensitive" as const } } },
    ],
    ...extra,
  };
}

export function publicVideoCatalogWhere(extra: Record<string, unknown> = {}) {
  return {
    status: "PUBLISHED" as const,
    AND: [
      { NOT: { slug: { startsWith: TEST_CATALOG_SLUG_PREFIX } } },
      { NOT: { title: { startsWith: TEST_CATALOG_TITLE_PREFIX, mode: "insensitive" as const } } },
    ],
    ...extra,
  };
}

export function publicShopProductCatalogWhere(extra: Record<string, unknown> = {}) {
  return {
    status: "PUBLISHED" as const,
    AND: [
      { NOT: { slug: { startsWith: TEST_CATALOG_SLUG_PREFIX } } },
      { NOT: { name: { startsWith: TEST_CATALOG_TITLE_PREFIX, mode: "insensitive" as const } } },
    ],
    ...extra,
  };
}
