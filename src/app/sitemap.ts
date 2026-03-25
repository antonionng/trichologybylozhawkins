import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/client";
import { getSiteUrl } from "@/lib/seo";
import { blogHighlights } from "@/lib/content";

type SitemapItem = MetadataRoute.Sitemap[number];

function toUrl(path: string) {
  return `${getSiteUrl()}${path}`;
}

function addEntry(
  entries: Map<string, SitemapItem>,
  path: string,
  lastModified?: Date | string | null,
  priority?: number,
  changeFrequency?: SitemapItem["changeFrequency"],
) {
  const url = toUrl(path);
  const existing = entries.get(url);
  const normalizedLastModified = lastModified ?? new Date();
  const existingDate = existing?.lastModified ? new Date(existing.lastModified) : null;
  const nextDate = normalizedLastModified ? new Date(normalizedLastModified) : null;
  const mergedLastModified =
    existingDate && nextDate
      ? existingDate > nextDate
        ? existingDate
        : nextDate
      : existing?.lastModified ?? normalizedLastModified;

  entries.set(url, {
    url: toUrl(path),
    lastModified: mergedLastModified,
    priority: priority ?? existing?.priority,
    changeFrequency: changeFrequency ?? existing?.changeFrequency,
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, SitemapItem>();

  addEntry(entries, "/", new Date(), 1, "weekly");
  addEntry(entries, "/about", new Date(), 0.8, "monthly");
  addEntry(entries, "/services", new Date(), 0.9, "monthly");
  addEntry(entries, "/contact", new Date(), 0.8, "monthly");
  addEntry(entries, "/education", new Date(), 0.95, "weekly");
  addEntry(entries, "/education/videos", new Date(), 0.9, "weekly");
  addEntry(entries, "/education/workshops", new Date(), 0.85, "weekly");
  addEntry(entries, "/education/conditions", new Date(), 0.85, "weekly");
  addEntry(entries, "/blog", new Date(), 0.9, "weekly");
  addEntry(entries, "/shop", new Date(), 0.75, "weekly");
  addEntry(entries, "/privacy", new Date(), 0.2, "yearly");
  addEntry(entries, "/terms", new Date(), 0.2, "yearly");
  addEntry(entries, "/cookies", new Date(), 0.2, "yearly");
  blogHighlights.forEach((entry) => {
    addEntry(entries, `/blog/${entry.slug}`, entry.published, 0.72, "monthly");
  });

  try {
    const [
      courses,
      videos,
      workshops,
      conditions,
      products,
      quizzes,
      blogCollection,
      blogSlots,
    ] = await Promise.all([
      prisma.course.findMany({
        where: { status: "PUBLISHED", slug: { not: "academy-quizzes" } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.videoProduct.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.workshop.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.conditionReference.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.shopProduct.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.quiz.findMany({
        where: { status: "PUBLISHED", isPublic: true, slug: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.collection.findUnique({
        where: { slug: "blog-posts" },
        select: { id: true },
      }),
      prisma.contentSlot.findMany({
        where: { channel: "BLOG", status: "PUBLISHED" },
        select: { id: true, metadata: true, updatedAt: true },
      }),
    ]);

    if (blogCollection?.id) {
      const blogEntries = await prisma.entry.findMany({
        where: { collectionId: blogCollection.id, status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      });

      blogEntries.forEach((entry) => {
        addEntry(entries, `/blog/${entry.slug}`, entry.updatedAt, 0.72, "monthly");
      });
    }

    blogSlots.forEach((slot) => {
      const meta = (slot.metadata ?? {}) as Record<string, unknown>;
      const slug = typeof meta.slug === "string" ? meta.slug : slot.id;
      addEntry(entries, `/blog/${slug}`, slot.updatedAt, 0.72, "monthly");
    });

    courses.forEach((course) => {
      addEntry(entries, `/education/${course.slug}`, course.updatedAt, 0.82, "weekly");
    });
    videos.forEach((video) => {
      addEntry(entries, `/education/videos/${video.slug}`, video.updatedAt, 0.8, "weekly");
    });
    workshops.forEach((workshop) => {
      addEntry(entries, `/education/workshops/${workshop.slug}`, workshop.updatedAt, 0.78, "monthly");
    });
    conditions.forEach((condition) => {
      addEntry(entries, `/education/conditions/${condition.slug}`, condition.updatedAt, 0.76, "monthly");
    });
    products.forEach((product) => {
      addEntry(entries, `/shop/${product.slug}`, product.updatedAt, 0.7, "weekly");
    });
    quizzes.forEach((quiz) => {
      if (quiz.slug) {
        addEntry(entries, `/quiz/${quiz.slug}`, quiz.updatedAt, 0.68, "monthly");
      }
    });
  } catch {
    return Array.from(entries.values());
  }

  return Array.from(entries.values());
}
