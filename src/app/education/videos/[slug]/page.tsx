export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { enrollInVideo } from "@/app/actions/education";
import { prisma } from "@/server/db/client";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { Surface } from "@/components/layout/Surface";
import { ButtonLink } from "@/components/ui/Button";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { getCurrentSession } from "@/server/security/auth";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";
import { VideoPurchaseButton } from "@/components/education/VideoPurchaseButton";
import { videoDetailFallbacks, videoLessons, VIDEO_HERO_PLACEHOLDER_BY_SLUG, VIDEO_HERO_PLACEHOLDER_DEFAULT } from "@/lib/content";
import { getTopicAccent } from "@/lib/topicAccents";
import { ArticleCta } from "@/components/sections/ArticleCta";

type FaqItem = { question: string; answer: string };

/* ── Normalised shape that works for DB data or fallback ────────────────── */

type VideoDetail = {
  source: "db" | "fallback";
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  priceLabel: string;
  headline: string | undefined;
  intro: string | undefined;
  whoItsFor: string[];
  outcomes: string[];
  benefits: string[];
  whatItsNot: string[];
  faqs: FaqItem[];
  heroUrl: string | null;
  // Only present for DB videos
  dbId?: string;
  dbPriceId?: string;
  dbAmount?: number;
  dbCurrency?: string;
};

type RelatedVideo = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  priceLabel: string;
  heroUrl: string | null;
};

async function getVideoFromDb(slug: string): Promise<VideoDetail | null> {
  try {
    const video = await prisma.videoProduct.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        heroMedia: true,
        pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      },
    });
    if (!video) return null;

    const primaryPrice = video.pricing.find((p) => p.isPrimary) || video.pricing[0];
    const priceLabel = primaryPrice
      ? primaryPrice.currency === "GBP"
        ? `£${primaryPrice.amount}`
        : `${primaryPrice.currency} ${primaryPrice.amount}`
      : "Free";
    let heroUrl: string | null = null;
    if (video.heroMedia?.path) {
      try { heroUrl = await createSignedDownloadUrl(video.heroMedia.path); } catch { /* use null */ }
    }
    if (!heroUrl) heroUrl = VIDEO_HERO_PLACEHOLDER_BY_SLUG[video.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
    const pc = (video.publicContent ?? {}) as any;

    return {
      source: "db",
      id: video.id,
      slug: video.slug,
      title: video.title,
      category: video.category || "Video Course",
      duration: video.durationMinutes ? `${video.durationMinutes} mins` : "Self-paced",
      priceLabel,
      headline: typeof pc.headline === "string" ? pc.headline : undefined,
      intro: typeof pc.intro === "string" ? pc.intro : undefined,
      whoItsFor: Array.isArray(pc.whoItsFor) ? pc.whoItsFor : [],
      outcomes: Array.isArray(pc.learningOutcomes) ? pc.learningOutcomes : [],
      benefits: Array.isArray(pc.benefits) ? pc.benefits : [],
      whatItsNot: Array.isArray(pc.whatItsNot) ? pc.whatItsNot : [],
      faqs: Array.isArray(pc.faqs) ? pc.faqs : [],
      heroUrl,
      dbId: video.id,
      dbPriceId: primaryPrice?.id,
      dbAmount: primaryPrice ? Number(primaryPrice.amount) : undefined,
      dbCurrency: primaryPrice?.currency,
    };
  } catch {
    return null;
  }
}

function getVideoFromFallback(slug: string): VideoDetail | null {
  const fb = videoDetailFallbacks.find((v) => v.slug === slug);
  if (!fb) return null;
  return {
    source: "fallback",
    id: fb.slug,
    slug: fb.slug,
    title: fb.title,
    category: fb.category,
    duration: `${fb.durationMinutes} mins`,
    priceLabel: fb.price,
    headline: fb.headline,
    intro: fb.intro,
    whoItsFor: fb.whoItsFor,
    outcomes: fb.learningOutcomes,
    benefits: fb.benefits,
    whatItsNot: fb.whatItsNot,
    faqs: fb.faqs,
    heroUrl: VIDEO_HERO_PLACEHOLDER_BY_SLUG[slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT,
  };
}

async function getRelatedVideos(
  currentSlug: string,
  currentCategory: string
): Promise<RelatedVideo[]> {
  // Try DB first
  try {
    const related = await prisma.videoProduct.findMany({
      where: {
        status: "PUBLISHED",
        slug: { not: currentSlug },
      },
      include: {
        pricing: { where: { isPrimary: true }, take: 1 },
        heroMedia: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    if (related.length > 0) {
      // Sort so same-category comes first
      const sorted = [
        ...related.filter((v) => v.category === currentCategory),
        ...related.filter((v) => v.category !== currentCategory),
      ].slice(0, 3);

      const results: RelatedVideo[] = [];
      for (const rv of sorted) {
        const p = rv.pricing[0];
        let heroUrl: string | null = null;
        if (rv.heroMedia?.path) {
          try { heroUrl = await createSignedDownloadUrl(rv.heroMedia.path); } catch { /* use null */ }
        }
        if (!heroUrl) heroUrl = VIDEO_HERO_PLACEHOLDER_BY_SLUG[rv.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
        results.push({
          id: rv.id,
          slug: rv.slug,
          title: rv.title,
          category: rv.category || "Video Course",
          duration: rv.durationMinutes ? `${rv.durationMinutes} mins` : "Self-paced",
          priceLabel: p
            ? p.currency === "GBP"
              ? `£${p.amount}`
              : `${p.currency} ${p.amount}`
            : "Free",
          heroUrl,
        });
      }
      return results;
    }
  } catch {
    // Fall through to static fallback
  }

  // Fallback: use videoLessons from content.ts
  return videoLessons
    .filter((l) => l.slug !== currentSlug)
    .slice(0, 3)
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      category: l.category,
      duration: l.duration,
      priceLabel: l.investment,
      heroUrl: VIDEO_HERO_PLACEHOLDER_BY_SLUG[l.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT,
    }));
}

/* ── Page component ─────────────────────────────────────────────────────── */

export default async function VideoDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // Try DB, then fallback
  const video =
    (await getVideoFromDb(params.slug)) ?? getVideoFromFallback(params.slug);

  if (!video) notFound();

  const [relatedVideos, session] = await Promise.all([
    getRelatedVideos(video.slug, video.category),
    getCurrentSession(),
  ]);
  const accent = getTopicAccent(video.category);
  const isLoggedIn = !!session;
  const featuredLeadItem = await getCurrentFeaturedLeadItem();
  const isCurrentFreeSignupVideo =
    featuredLeadItem?.kind === "VIDEO" && !!video.dbId && featuredLeadItem.id === video.dbId;

  async function claimFreeLesson() {
    "use server";

    if (!video.dbId) {
      throw new Error("Video not found");
    }

    await enrollInVideo(video.dbId);
  }

  return (
    <main className="min-h-screen">
      {/* ── Hero & content ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/50 via-brand-linen/20 to-white pb-10 pt-8 sm:pb-14 sm:pt-10">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-brand-graphite/40">
            <Link href="/education/videos" className="hover:text-brand-graphite transition-colors">Video courses</Link>
            <span>/</span>
            <span className="text-brand-graphite/60 truncate">{video.title}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            {/* ── Left column ──────────────────────────────────────── */}
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <span className={`inline-flex rounded-full ${accent.bg} px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${accent.text}`}>
                  {video.category}
                </span>
                <h1 className="font-display text-3xl leading-tight text-brand-graphite sm:text-[2.25rem]">
                  {video.headline ?? video.title}
                </h1>
                {video.intro && (
                  <p className="max-w-xl text-sm leading-relaxed text-brand-graphite/65">{video.intro}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {[video.duration, video.priceLabel, "Watch anytime"].map((tag) => (
                    <span key={tag} className="rounded-full border border-brand-graphite/8 bg-white/50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-brand-graphite/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content sections */}
              <div className="grid gap-4 sm:grid-cols-2">
                {video.whoItsFor.length > 0 && (
                  <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4 space-y-2`}>
                    <h2 className={`text-[10px] uppercase tracking-[0.25em] ${accent.text} font-bold`}>Who this is for</h2>
                    <ul className="space-y-1.5">
                      {video.whoItsFor.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-graphite/70">
                          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {video.outcomes.length > 0 && (
                  <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-2">
                    <h2 className="text-[10px] uppercase tracking-[0.25em] text-brand-graphite/50 font-bold">What you&rsquo;ll learn</h2>
                    <ol className="space-y-1.5">
                      {video.outcomes.map((o, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-graphite/70">
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accent.bg} text-[10px] font-bold ${accent.text}`}>{i + 1}</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {video.benefits.length > 0 && (
                  <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-2">
                    <h2 className="text-[10px] uppercase tracking-[0.25em] text-brand-graphite/50 font-bold">After watching, you&rsquo;ll</h2>
                    <ul className="space-y-1.5">
                      {video.benefits.map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-graphite/70">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-sage/50" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {video.whatItsNot.length > 0 && (
                  <div className="rounded-xl border border-brand-graphite/6 bg-brand-graphite/[0.02] p-4 space-y-2">
                    <h2 className="text-[10px] uppercase tracking-[0.25em] text-brand-graphite/45 font-bold">What this course is not</h2>
                    <ul className="space-y-1.5">
                      {video.whatItsNot.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-graphite/50">
                          <span className="mt-0.5 text-brand-graphite/25 text-xs">&times;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-brand-graphite/35 italic">Evidence-based education, not medical advice.</p>
                  </div>
                )}
              </div>

              {/* FAQs */}
              {video.faqs.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-[10px] uppercase tracking-[0.25em] text-brand-graphite/45 font-bold">Common questions</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {video.faqs.map((faq, i) => (
                      <div key={i} className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-1">
                        <p className="text-sm font-semibold text-brand-graphite">{faq.question}</p>
                        <p className="text-sm leading-relaxed text-brand-graphite/55">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="sticky top-24 space-y-4">
              {/* Hero placeholder */}
              {video.heroUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/20">
                  <Image src={video.heroUrl} alt={video.title} width={640} height={640} className="h-full w-full object-cover" priority />
                </div>
              ) : (
                <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${accent.gradient} border ${accent.border} flex items-center justify-center`}>
                  <div className="space-y-2 text-center">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${accent.bg}`}>
                      <svg className={`h-5 w-5 ${accent.text}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-graphite/30 font-semibold">Video course</p>
                  </div>
                </div>
              )}

              {/* Access card */}
              <div className={`rounded-xl border ${accent.border} bg-white p-5 space-y-4 shadow-sm`}>
                <div className="text-center space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-brand-graphite/35 font-bold">Instant access</p>
                  <div className="text-2xl font-bold text-brand-graphite">{video.priceLabel}</div>
                </div>
                {isLoggedIn && video.dbId && isCurrentFreeSignupVideo ? (
                  <form action={claimFreeLesson}>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-brand-graphite px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-graphite/85"
                    >
                      Unlock free lesson
                    </button>
                  </form>
                ) : isLoggedIn ? (
                  <ButtonLink href="/academy" variant="secondary" size="sm" className="w-full justify-center">Go to Academy</ButtonLink>
                ) : video.dbId && video.dbPriceId && video.dbAmount != null && video.dbCurrency ? (
                  <VideoPurchaseButton
                    videoProductId={video.dbId}
                    priceId={video.dbPriceId}
                    amount={video.dbAmount}
                    currency={video.dbCurrency}
                  />
                ) : (
                  <ButtonLink href="/login" variant="secondary" size="sm" className="w-full justify-center">Sign in to watch</ButtonLink>
                )}
                <ul className="space-y-1.5 text-[11px] text-brand-graphite/45">
                  {["Watch anytime — no expiry", "Instant Academy access"].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="text-brand-sage text-xs">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust */}
              <div className="rounded-xl border border-brand-graphite/5 bg-brand-sand/30 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-brand-graphite">Created by Lorraine Hawkins</p>
                <p className="text-[11px] leading-relaxed text-brand-graphite/50">18 years clinical experience. Evidence-based education designed for hair professionals.</p>
                <ButtonLink href="/about" variant="ghost" size="sm">About Lorraine &rarr;</ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── Related videos ──────────────────────────────────────────── */}
      {relatedVideos.length > 0 && (
        <section className="border-t border-brand-graphite/6 py-8 sm:py-10">
          <Container>
            <h2 className="mb-5 font-display text-xl text-brand-graphite">Related training modules</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedVideos.map((rv) => {
                const rvAccent = getTopicAccent(rv.category);
                return (
                  <Link key={rv.id} href={`/education/videos/${rv.slug}`} className="group block h-full">
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-md hover:border-brand-graphite/15">
                      {/* Hero image or gradient */}
                      <div className="relative h-28 overflow-hidden">
                        {rv.heroUrl ? (
                          <>
                            <Image src={rv.heroUrl} alt={rv.title} width={400} height={200} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </>
                        ) : (
                          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${rvAccent.gradient}`}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110">
                              <svg className={`h-3.5 w-3.5 ${rvAccent.text}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <span className={`absolute left-2 top-2 rounded-full ${rvAccent.bg} px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${rvAccent.text}`}>{rv.category}</span>
                        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brand-graphite shadow-sm">{rv.priceLabel}</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-4">
                        <h3 className="font-display text-sm leading-snug text-brand-graphite group-hover:text-brand-salmon transition-colors">{rv.title}</h3>
                        <p className="text-[11px] text-brand-graphite/40">{rv.duration}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      <ArticleCta category={video.category} />

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-brand-graphite/6 bg-brand-sand/25 py-8 sm:py-10">
        <Container>
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-lg text-brand-graphite">Not sure which module is right for you?</h2>
              <p className="mt-1 text-sm text-brand-graphite/55">Explore the full training catalogue or get in touch to discuss your learning goals.</p>
            </div>
            <div className="flex gap-3">
              <ButtonLink href="/education/videos" variant="ghost" size="sm">&larr; All modules</ButtonLink>
              <ButtonLink href="/education" variant="primary" size="sm">View all training</ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
