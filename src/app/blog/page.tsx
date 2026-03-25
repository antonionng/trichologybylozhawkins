export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/server/db/client";
import { Container } from "@/components/layout/Container";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { blogHighlights, BlogHighlight } from "@/lib/content";
import { getTopicAccent } from "@/lib/topicAccents";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/blog",
  title: "Knowledge Hub",
  description:
    "Evidence-based articles from Lorraine Hawkins on scalp health, hair loss, consultations, and trichology practice.",
  keywords: [
    "trichology blog",
    "scalp health articles",
    "hair loss advice",
    "knowledge hub",
  ],
});

type BlogEntryRecord = {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  publishedAt: Date | null;
  createdAt: Date;
  meta: unknown;
};

type BlogSlotRecord = {
  id: string;
  title: string;
  brief: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  metadata: unknown;
};

const mapEntryToBlogHighlight = (entry: BlogEntryRecord): BlogHighlight => {
  const meta = (entry.meta ?? {}) as Record<string, any>;
  return {
    id: entry.id,
    title: entry.title,
    excerpt: entry.summary || "",
    category: meta.category || "Article",
    slug: entry.slug,
    published: entry.publishedAt
      ? entry.publishedAt.toISOString().slice(0, 10)
      : entry.createdAt.toISOString().slice(0, 10),
    heroImage: meta.heroImage || undefined,
  };
};

const mapContentSlotToBlogHighlight = (slot: BlogSlotRecord): BlogHighlight => {
  const meta = (slot.metadata ?? {}) as Record<string, any>;
  return {
    id: slot.id,
    title: slot.title,
    excerpt: slot.brief || meta.excerpt || "",
    category: meta.category || "Article",
    slug: meta.slug || slot.id,
    published: slot.publishedAt
      ? slot.publishedAt.toISOString().slice(0, 10)
      : slot.createdAt.toISOString().slice(0, 10),
    heroImage: meta.heroImage || undefined,
  };
};

export function mergeBlogHighlights(
  entries: BlogEntryRecord[],
  slots: BlogSlotRecord[],
): BlogHighlight[] {
  const merged = new Map<string, BlogHighlight>();

  for (const entry of entries) {
    const item = mapEntryToBlogHighlight(entry);
    merged.set(item.slug, item);
  }

  for (const slot of slots) {
    const item = mapContentSlotToBlogHighlight(slot);
    if (!merged.has(item.slug)) {
      merged.set(item.slug, item);
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.published.localeCompare(a.published));
}

async function getBlogPosts(): Promise<BlogHighlight[]> {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: "blog-posts" },
    });

    if (collection) {
      const entries = await prisma.entry.findMany({
        where: { collectionId: collection.id, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 20,
      });

      const slots = await prisma.contentSlot.findMany({
        where: { channel: "BLOG", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 20,
      });

      const merged = mergeBlogHighlights(entries as BlogEntryRecord[], slots as BlogSlotRecord[]);
      if (merged.length > 0) {
        return merged;
      }
    }

    // Fall back to ContentSlot (Content Factory)
    const slots = await prisma.contentSlot.findMany({
      where: { channel: "BLOG", status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 10,
    });
    if (slots.length > 0) {
      return slots.map((slot) => mapContentSlotToBlogHighlight(slot as BlogSlotRecord));
    }

    return [];
  } catch {
    return [];
  }
}

function fmtDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day?.padStart(2, "0") ?? "01"} ${months[Number(month) - 1] ?? month} ${year}`;
}

export default async function Blog() {
  const dbPosts = await getBlogPosts();
  const allPosts = dbPosts.length > 0 ? dbPosts : blogHighlights;
  const [featured, ...rest] = allPosts;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-14 sm:pb-12 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-start">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">
                Knowledge Hub
              </span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                Practical insights from real experience
              </h1>
              <p className="text-sm leading-relaxed text-brand-graphite/60">
                Evidence-based articles on hair loss, scalp health, and
                trichology practice, written by Lorraine from 18 years of
                clinical experience.
              </p>
            </div>

            {/* Featured article */}
            {featured &&
              (() => {
                const accent = getTopicAccent(featured.category);
                return (
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="group block"
                  >
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white shadow-sm transition-all hover:shadow-md">
                      {featured.heroImage ? (
                        <div className="relative h-40 sm:h-48">
                          <img
                            src={featured.heroImage}
                            alt={featured.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-graphite shadow-sm">
                            Featured
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`h-32 bg-gradient-to-br ${accent.gradient} relative`}
                        >
                          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
                          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-graphite shadow-sm">
                            Featured
                          </div>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full ${accent.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${accent.text}`}
                          >
                            {featured.category}
                          </span>
                          <span className="text-[10px] text-brand-graphite/35">
                            {fmtDate(featured.published)}
                          </span>
                        </div>
                        <h2 className="font-display text-lg leading-snug text-brand-graphite transition-colors group-hover:text-brand-salmon">
                          {featured.title}
                        </h2>
                        <p className="line-clamp-3 text-sm leading-relaxed text-brand-graphite/55">
                          {featured.excerpt}
                        </p>
                        <span className="mt-auto text-xs font-semibold text-brand-salmon">
                          Read article &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })()}
          </div>

          {/* Supporting articles row (top 3) */}
          {rest.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.slice(0, 3).map((article) => {
                const accent = getTopicAccent(article.category);
                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group block"
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:border-brand-graphite/15 hover:shadow-md">
                      {article.heroImage ? (
                        <div className="h-32">
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`h-1 bg-gradient-to-r ${accent.gradient}`}
                        />
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full ${accent.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${accent.text}`}
                          >
                            {article.category}
                          </span>
                          <span className="text-[10px] text-brand-graphite/35">
                            {fmtDate(article.published)}
                          </span>
                        </div>
                        <h3 className="font-display text-base leading-snug text-brand-graphite transition-colors group-hover:text-brand-salmon">
                          {article.title}
                        </h3>
                        <p className="flex-1 line-clamp-2 text-xs leading-relaxed text-brand-graphite/50">
                          {article.excerpt}
                        </p>
                        <span className="mt-auto text-[11px] font-semibold text-brand-salmon">
                          Read &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* All remaining articles */}
      {rest.length > 3 && (
        <section className="bg-white py-12">
          <Container>
            <h2 className="mb-8 font-display text-2xl text-brand-graphite">
              More articles
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.slice(3).map((article) => {
                const accent = getTopicAccent(article.category);
                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group block"
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:border-brand-graphite/15 hover:shadow-md">
                      {article.heroImage ? (
                        <div className="h-36">
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`h-1 bg-gradient-to-r ${accent.gradient}`}
                        />
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full ${accent.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${accent.text}`}
                          >
                            {article.category}
                          </span>
                          <span className="text-[10px] text-brand-graphite/35">
                            {fmtDate(article.published)}
                          </span>
                        </div>
                        <h3 className="font-display text-base leading-snug text-brand-graphite transition-colors group-hover:text-brand-salmon">
                          {article.title}
                        </h3>
                        <p className="flex-1 line-clamp-2 text-xs leading-relaxed text-brand-graphite/50">
                          {article.excerpt}
                        </p>
                        <span className="mt-auto text-[11px] font-semibold text-brand-salmon">
                          Read &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      <ConsultationCta />
    </main>
  );
}
