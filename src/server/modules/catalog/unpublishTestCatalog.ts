import { CourseStatus, ShopProductStatus } from "@prisma/client";
import {
  TEST_CATALOG_SLUG_PREFIX,
  TEST_CATALOG_TITLE_PREFIX,
  TEST_LIVE_CATALOG_SLUGS,
  TEST_LIVE_CATALOG_TITLES,
  isTestCatalogItem,
} from "@/lib/publicCatalog";

type CatalogPrisma = {
  course: {
    findMany: (args: unknown) => Promise<Array<{ id: string; slug: string; title: string; meta: unknown }>>;
    update: (args: unknown) => Promise<unknown>;
  };
  shopProduct: {
    findMany: (args: unknown) => Promise<Array<{ id: string; slug: string; name: string; meta: unknown }>>;
    update: (args: unknown) => Promise<unknown>;
  };
  videoProduct?: {
    findMany: (args: unknown) => Promise<Array<{ id: string; slug: string; title: string; meta: unknown }>>;
    update: (args: unknown) => Promise<unknown>;
  };
};

function mergeTestMeta(meta: unknown) {
  const current = meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {};
  return { ...current, isTest: true };
}

export async function unpublishTestCatalogItems(prisma: CatalogPrisma) {
  const courseWhere = {
    OR: [
      { slug: { in: [...TEST_LIVE_CATALOG_SLUGS] } },
      { slug: { startsWith: TEST_CATALOG_SLUG_PREFIX } },
      { title: { in: [...TEST_LIVE_CATALOG_TITLES] } },
      { title: { startsWith: TEST_CATALOG_TITLE_PREFIX, mode: "insensitive" as const } },
    ],
  };

  const productWhere = {
    OR: [
      { slug: { in: [...TEST_LIVE_CATALOG_SLUGS] } },
      { slug: { startsWith: TEST_CATALOG_SLUG_PREFIX } },
      { name: { in: [...TEST_LIVE_CATALOG_TITLES] } },
      { name: { startsWith: TEST_CATALOG_TITLE_PREFIX, mode: "insensitive" as const } },
    ],
  };

  const [courses, products, videos] = await Promise.all([
    prisma.course.findMany({ where: courseWhere, select: { id: true, slug: true, title: true, meta: true } }),
    prisma.shopProduct.findMany({ where: productWhere, select: { id: true, slug: true, name: true, meta: true } }),
    prisma.videoProduct
      ? prisma.videoProduct.findMany({
          where: courseWhere,
          select: { id: true, slug: true, title: true, meta: true },
        })
      : Promise.resolve([]),
  ]);

  const unpublished = {
    courses: [] as string[],
    products: [] as string[],
    videos: [] as string[],
  };

  for (const course of courses) {
    if (!isTestCatalogItem(course) && !TEST_LIVE_CATALOG_TITLES.includes(course.title as (typeof TEST_LIVE_CATALOG_TITLES)[number])) {
      continue;
    }
    await prisma.course.update({
      where: { id: course.id },
      data: { status: CourseStatus.DRAFT, meta: mergeTestMeta(course.meta) },
    });
    unpublished.courses.push(course.slug);
  }

  for (const product of products) {
    if (!isTestCatalogItem({ slug: product.slug, name: product.name, meta: product.meta })) {
      continue;
    }
    await prisma.shopProduct.update({
      where: { id: product.id },
      data: { status: ShopProductStatus.DRAFT, meta: mergeTestMeta(product.meta) },
    });
    unpublished.products.push(product.slug);
  }

  for (const video of videos) {
    if (!isTestCatalogItem(video)) {
      continue;
    }
    await prisma.videoProduct?.update({
      where: { id: video.id },
      data: { status: CourseStatus.DRAFT, meta: mergeTestMeta(video.meta) },
    });
    unpublished.videos.push(video.slug);
  }

  return unpublished;
}
