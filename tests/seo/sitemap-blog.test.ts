import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  prisma: {
    course: { findMany: vi.fn() },
    videoProduct: { findMany: vi.fn() },
    workshop: { findMany: vi.fn() },
    conditionReference: { findMany: vi.fn() },
    shopProduct: { findMany: vi.fn() },
    quiz: { findMany: vi.fn() },
    collection: { findUnique: vi.fn() },
    contentSlot: { findMany: vi.fn() },
    entry: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/server/db/client";
import sitemap, {
  isPublishedCmsStatus,
  lastModifiedFromCmsEntry,
  revalidate,
} from "@/app/sitemap";

const emptyCatalog = () => {
  vi.mocked(prisma.course.findMany).mockResolvedValue([]);
  vi.mocked(prisma.videoProduct.findMany).mockResolvedValue([]);
  vi.mocked(prisma.workshop.findMany).mockResolvedValue([]);
  vi.mocked(prisma.conditionReference.findMany).mockResolvedValue([]);
  vi.mocked(prisma.shopProduct.findMany).mockResolvedValue([]);
  vi.mocked(prisma.quiz.findMany).mockResolvedValue([]);
  vi.mocked(prisma.contentSlot.findMany).mockResolvedValue([]);
};

describe("sitemap Knowledge Hub CMS entries", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_ENV;
    vi.clearAllMocks();
    emptyCatalog();
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it("revalidates on a short interval so new posts appear without a deploy", () => {
    expect(revalidate).toBe(60);
  });

  it("uses publishedAt for lastModified when the entry has one", () => {
    const publishedAt = new Date("2026-10-06T09:15:25.278Z");
    const updatedAt = new Date("2026-10-07T12:00:00.000Z");
    expect(lastModifiedFromCmsEntry({ publishedAt, updatedAt })).toBe(publishedAt);
  });

  it("falls back to updatedAt when publishedAt is missing", () => {
    const updatedAt = new Date("2026-10-07T12:00:00.000Z");
    expect(lastModifiedFromCmsEntry({ publishedAt: null, updatedAt })).toBe(updatedAt);
  });

  it("treats only PUBLISHED as a public sitemap status", () => {
    expect(isPublishedCmsStatus("PUBLISHED")).toBe(true);
    expect(isPublishedCmsStatus("DRAFT")).toBe(false);
    expect(isPublishedCmsStatus("REVIEW")).toBe(false);
    expect(isPublishedCmsStatus("ARCHIVED")).toBe(false);
    expect(isPublishedCmsStatus(undefined)).toBe(false);
  });

  it("includes published CMS blog entries and excludes drafts", async () => {
    const publishedAt = new Date("2026-10-06T09:15:25.278Z");
    vi.mocked(prisma.collection.findUnique).mockResolvedValue({ id: "col_blog" } as any);
    vi.mocked(prisma.entry.findMany).mockResolvedValue([
      {
        slug: "patchy-hair-loss-red-flags-when-to-refer",
        status: "PUBLISHED",
        publishedAt,
        updatedAt: publishedAt,
      },
      {
        slug: "draft-only-hair-article",
        status: "DRAFT",
        publishedAt: null,
        updatedAt: new Date("2026-10-08T10:00:00.000Z"),
      },
    ] as any);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(prisma.collection.findUnique).toHaveBeenCalledWith({
      where: { slug: "blog-posts" },
      select: { id: true },
    });
    expect(prisma.entry.findMany).toHaveBeenCalledWith({
      where: { collectionId: "col_blog", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true, status: true },
    });
    expect(urls).toContain(
      "https://trichologyacademy.co.uk/blog/patchy-hair-loss-red-flags-when-to-refer",
    );
    expect(urls).not.toContain(
      "https://trichologyacademy.co.uk/blog/draft-only-hair-article",
    );

    const published = entries.find(
      (entry) =>
        entry.url ===
        "https://trichologyacademy.co.uk/blog/patchy-hair-loss-red-flags-when-to-refer",
    );
    expect(published?.lastModified).toEqual(publishedAt);
  });

  it("keeps today's static public routes even when CMS posts are present", async () => {
    vi.mocked(prisma.collection.findUnique).mockResolvedValue({ id: "col_blog" } as any);
    vi.mocked(prisma.entry.findMany).mockResolvedValue([
      {
        slug: "autumn-hair-shedding-seasonal-shed-or-refer",
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-13T09:06:55.362Z"),
        updatedAt: new Date("2026-10-13T09:06:55.362Z"),
      },
    ] as any);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain("https://trichologyacademy.co.uk/");
    expect(urls).toContain("https://trichologyacademy.co.uk/education");
    expect(urls).toContain("https://trichologyacademy.co.uk/clinic");
    expect(urls).toContain("https://trichologyacademy.co.uk/blog");
    expect(urls).toContain("https://trichologyacademy.co.uk/shop");
    expect(urls).toContain("https://trichologyacademy.co.uk/cookies");
    expect(urls).toContain(
      "https://trichologyacademy.co.uk/blog/autumn-hair-shedding-seasonal-shed-or-refer",
    );
    expect(urls).toContain(
      "https://trichologyacademy.co.uk/blog/decoding-hormonal-hair-loss",
    );
  });

  it("ignores unpublished content-factory blog slots", async () => {
    vi.mocked(prisma.collection.findUnique).mockResolvedValue({ id: "col_blog" } as any);
    vi.mocked(prisma.entry.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contentSlot.findMany).mockResolvedValue([
      {
        id: "slot_published",
        status: "PUBLISHED",
        publishedAt: new Date("2026-03-03T10:00:00.000Z"),
        updatedAt: new Date("2026-03-04T10:00:00.000Z"),
        metadata: { slug: "factory-published-slot" },
      },
      {
        id: "slot_draft",
        status: "DRAFT",
        publishedAt: null,
        updatedAt: new Date("2026-03-05T10:00:00.000Z"),
        metadata: { slug: "factory-draft-slot" },
      },
    ] as any);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain("https://trichologyacademy.co.uk/blog/factory-published-slot");
    expect(urls).not.toContain("https://trichologyacademy.co.uk/blog/factory-draft-slot");
  });
});
