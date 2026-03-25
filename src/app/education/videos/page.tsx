export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/server/db/client";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { VideoPurchaseButton } from "@/components/education/VideoPurchaseButton";
import { FreeAcademyVideoPromoSection } from "@/components/sections/FreeAcademyVideoPromoSection";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { videoLessons, videoDetailFallbacks, VIDEO_HERO_PLACEHOLDER_BY_SLUG, VIDEO_HERO_PLACEHOLDER_DEFAULT } from "@/lib/content";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { getTopicAccent } from "@/lib/topicAccents";
import { photography } from "@/lib/visualAssets";
import { buildPageMetadata } from "@/lib/seo";

/* ── Normalised card shape ─────────────────────────────────────────────── */

type VideoCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: string;
  whoItsFor: string;
  highlights: string[];
  heroUrl: string | null;
  isFreeOnSignup?: boolean;
  dbVideoProductId?: string;
  dbPriceId?: string;
  dbAmount?: number;
  dbCurrency?: string;
};

async function getVideos(): Promise<VideoCardData[]> {
  try {
    const lead = await getCurrentFeaturedLeadItem();
    const freeSignupVideo = lead?.kind === "VIDEO" ? lead : null;
    const dbVideos = await prisma.videoProduct.findMany({
      where: { status: "PUBLISHED" },
      include: {
        heroMedia: true,
        pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (dbVideos.length > 0) {
      const cards: VideoCardData[] = [];
      for (const v of dbVideos) {
        const pp = v.pricing.find((p) => p.isPrimary) || v.pricing[0];
        const isCurrentFreeSignupVideo = freeSignupVideo?.id === v.id;
        const priceLabel = pp
          ? isCurrentFreeSignupVideo
            ? "Free with signup"
            : pp.currency === "GBP" ? `\u00A3${pp.amount}` : `${pp.currency} ${pp.amount}`
          : "Free";
        let heroUrl: string | null = null;
        if (v.heroMedia?.path) {
          try { heroUrl = await createSignedDownloadUrl(v.heroMedia.path); } catch { /* use null */ }
        }
        if (!heroUrl) heroUrl = VIDEO_HERO_PLACEHOLDER_BY_SLUG[v.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
        const pc = v.publicContent as any;
        cards.push({
          id: v.id, slug: v.slug, title: v.title,
          category: v.category || "Video Course",
          duration: v.durationMinutes ? `${v.durationMinutes} mins` : "Self-paced",
          price: priceLabel,
          whoItsFor: pc?.whoItsFor?.[0] || v.subtitle || "",
          highlights: (pc?.learningOutcomes || []).slice(0, 3),
          heroUrl,
          isFreeOnSignup: isCurrentFreeSignupVideo,
          dbVideoProductId: v.id, dbPriceId: pp?.id,
          dbAmount: pp ? Number(pp.amount) : undefined, dbCurrency: pp?.currency,
        });
      }
      return cards;
    }
  } catch { /* fall through */ }

  return videoLessons.map((l) => {
    const detail = videoDetailFallbacks.find((d) => d.slug === l.slug);
    return {
      id: l.id, slug: l.slug, title: l.title, category: l.category,
      duration: l.duration, price: l.investment,
      whoItsFor: detail?.whoItsFor?.[0] || l.summary,
      highlights: detail?.learningOutcomes?.slice(0, 3) || l.highlights,
      heroUrl: VIDEO_HERO_PLACEHOLDER_BY_SLUG[l.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT,
    };
  });
}

async function getFreeSignupVideoPromo() {
  try {
    const lead = await getCurrentFeaturedLeadItem();
    if (!lead) return null;

    let heroUrl: string | null = null;
    if (lead.kind === "VIDEO" && lead.heroMedia?.path) {
      try {
        heroUrl = await createSignedDownloadUrl(lead.heroMedia.path);
      } catch {
        heroUrl = null;
      }
    }
    if (!heroUrl && lead.kind === "VIDEO") {
      heroUrl = VIDEO_HERO_PLACEHOLDER_BY_SLUG[lead.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
    }

    return lead.kind === "QUIZ"
      ? {
          kind: "QUIZ" as const,
          id: lead.id,
          slug: lead.slug,
          title: lead.title,
          description: lead.description,
          category: "Academy quiz",
          heroUrl,
        }
      : {
          kind: "VIDEO" as const,
          id: lead.id,
          slug: lead.slug,
          title: lead.title,
          subtitle: lead.subtitle,
          description: lead.description,
          category: lead.category,
          durationLabel: lead.durationMinutes ? `${lead.durationMinutes} mins` : "Self-paced",
          heroUrl,
        };
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */

export default async function VideoCatalogPage() {
  const [videos, freeSignupVideo] = await Promise.all([
    getVideos(),
    getFreeSignupVideoPromo(),
  ]);

  return (
    <main className="min-h-screen">
      {/* ── Hero with image ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/50 via-brand-linen/20 to-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-16 sm:pb-12 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">
                Video courses
              </span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                Condition-specific video training
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-brand-graphite/65">
                Focused training modules on the conditions your clients present with most. Each course gives you the clinical knowledge and language to assess, explain, and support with confidence.
              </p>
              <div className="flex flex-wrap gap-5 pt-1">
                {[
                  { value: String(videos.length), label: "Courses" },
                  { value: "From \u00A329", label: "Per module" },
                  { value: "No expiry", label: "Watch anytime" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-brand-graphite">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-graphite/40">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/videos-hero-placeholder.png"
                  alt="Clinical video training modules for hair professionals"
                  width={800}
                  height={500}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              {/* How it works overlay card */}
              <div className="absolute -bottom-6 -left-4 rounded-xl border border-brand-graphite/8 bg-white/95 p-4 shadow-md backdrop-blur-sm sm:-left-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/40">How it works</p>
                <div className="space-y-2">
                  {[
                    { n: "1", t: "Choose a condition" },
                    { n: "2", t: "Learn the clinical framework" },
                    { n: "3", t: "Apply with your clients" },
                  ].map((item) => (
                    <div key={item.n} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-salmon/12 text-[10px] font-bold text-brand-salmon">{item.n}</span>
                      <p className="text-xs font-medium text-brand-graphite">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {freeSignupVideo ? <FreeAcademyVideoPromoSection lead={freeSignupVideo} /> : null}

      {/* ── Course cards ─────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <Container>
          {videos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-graphite/15 bg-white/50 px-8 py-20 text-center">
              <p className="text-sm text-brand-graphite/50">Courses are being prepared. Check back soon.</p>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Message from Lorraine ──────────────────────────────────── */}
      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/10 via-brand-sand/20 to-white py-10 sm:py-14">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="shrink-0">
              <Image
                src={photography.hero.src}
                alt="Lorraine Hawkins"
                width={120}
                height={120}
                className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-white"
              />
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">Why I created these</p>
              <blockquote className="text-base leading-relaxed text-brand-graphite/75 italic">
                &ldquo;These modules cover the conditions I see most often in clinic. I created them so you can quickly build confidence with specific presentations &mdash; the clinical picture, what to look for, how to explain it to your client, and when to refer.&rdquo;
              </blockquote>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-brand-graphite">Lorraine Hawkins</p>
                <p className="text-xs text-brand-graphite/50">Fellow, Institute of Trichologists &middot; 18 years clinical practice</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section className="bg-brand-sand/25 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-2">
              <h2 className="font-display text-lg text-brand-graphite">Built by a practising clinician</h2>
              <p className="max-w-xl text-sm leading-relaxed text-brand-graphite/60">
                Every module is drawn from 18 years of clinical experience. Lorraine teaches what she sees in practice &mdash; real presentations, evidence-based guidance, practical language you can use with clients.
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-graphite/50">
                {["Evidence-based", "Clinically grounded", "Practical frameworks", "Unlimited rewatches"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-brand-salmon/60" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <ButtonLink href="/about" variant="ghost" size="sm">About Lorraine</ButtonLink>
              <ButtonLink href="/education" variant="primary" size="sm">View all training</ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <ConsultationCta />
    </main>
  );
}

export const metadata = buildPageMetadata({
  path: "/education/videos",
  title: "Trichology Video Courses",
  description:
    "Browse Lorraine Hawkins video courses on hair loss, scalp health, hormonal change, and consultation confidence for hair professionals.",
  keywords: [
    "trichology video courses",
    "hair loss training",
    "scalp health video training",
    "professional hair education",
  ],
});

/* ═══════════════════════════════════════════════════════════════════════════
   VideoCard
   ═══════════════════════════════════════════════════════════════════════ */

function VideoCard({ video }: { video: VideoCardData }) {
  const accent = getTopicAccent(video.category);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-lg hover:border-brand-graphite/15">
      {/* Hero area */}
      <Link href={`/education/videos/${video.slug}`} className="relative block">
        {video.heroUrl ? (
          <div className="relative h-44 overflow-hidden">
            <Image src={video.heroUrl} alt={video.title} width={800} height={400} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        ) : (
          <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <svg className={`h-5 w-5 ${accent.text}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
            <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full ${accent.bg} opacity-50`} />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/20" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-graphite shadow-sm backdrop-blur-sm">{video.price}</span>
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{video.duration}</span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className={`mb-2 inline-flex self-start rounded-full ${accent.bg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${accent.text}`}>{video.category}</span>
        <h3 className="mb-2 font-display text-lg leading-snug text-brand-graphite">
          <Link href={`/education/videos/${video.slug}`} className="transition-colors hover:text-brand-salmon">{video.title}</Link>
        </h3>
        {video.whoItsFor && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-brand-graphite/60">{video.whoItsFor}</p>
        )}
        {video.highlights.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {video.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-brand-graphite/55">
                <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-brand-sage/12 text-[8px] font-bold text-brand-sage">&#10003;</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-3 border-t border-brand-graphite/6 pt-4">
          <div className="flex-1">
            {video.dbVideoProductId && video.dbPriceId ? (
              <VideoPurchaseButton videoProductId={video.dbVideoProductId} priceId={video.dbPriceId} amount={video.dbAmount!} currency={video.dbCurrency!} />
            ) : (
              <ButtonLink href={`/education/videos/${video.slug}`} variant="secondary" size="sm" className="w-full justify-center">Learn more</ButtonLink>
            )}
          </div>
          <Link href={`/education/videos/${video.slug}`} className="shrink-0 text-xs font-medium text-brand-graphite/40 transition-colors hover:text-brand-salmon">
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
