export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { FaqSection } from "@/components/sections/FaqSection";
import { FreeAcademyVideoPromoSection } from "@/components/sections/FreeAcademyVideoPromoSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { Surface } from "@/components/layout/Surface";
import { videoLessons, videoDetailFallbacks, inPersonIntensives, VIDEO_HERO_PLACEHOLDER_BY_SLUG, VIDEO_HERO_PLACEHOLDER_DEFAULT } from "@/lib/content";
import { getCourses, getPublicQuizzes, getWorkshops } from "@/app/actions/education";
import { PurchaseButton } from "@/components/education/PurchaseButton";
import { prisma } from "@/server/db/client";
import { getCurrentSession } from "@/server/security/auth";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";
import { getTopicAccent } from "@/lib/topicAccents";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { photography } from "@/lib/visualAssets";

/* ── Normalised video shape ────────────────────────────────────────────── */
type VideoCard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: string;
  whoItsFor: string;
  highlights: string[];
  heroUrl: string | null;
  fromDb: boolean;
};

type WorkshopCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  duration: string;
  investment: string;
  location: string;
  outcomes: string[];
};

export function selectFeaturedWorkshops(
  dbWorkshops: WorkshopCard[],
  fallbackWorkshops: WorkshopCard[],
) {
  return dbWorkshops.length > 0 ? dbWorkshops : fallbackWorkshops;
}

async function getVideos(): Promise<VideoCard[]> {
  try {
    const dbVideos = await prisma.videoProduct.findMany({
      where: { status: "PUBLISHED" },
      include: {
        heroMedia: true,
        pricing: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (dbVideos.length > 0) {
      const cards: VideoCard[] = [];
      for (const v of dbVideos) {
        const pp = v.pricing.find((p) => p.isPrimary) || v.pricing[0];
        const pc = v.publicContent as any;
        let heroUrl: string | null = null;
        if (v.heroMedia?.path) {
          try { heroUrl = await createSignedDownloadUrl(v.heroMedia.path); } catch { /* use null */ }
        }
        if (!heroUrl) heroUrl = VIDEO_HERO_PLACEHOLDER_BY_SLUG[v.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
        cards.push({
          id: v.id,
          slug: v.slug,
          title: v.title,
          category: v.category || "Video Course",
          duration: v.durationMinutes ? `${v.durationMinutes} mins` : "Self-paced",
          price: pp ? (pp.currency === "GBP" ? `\u00A3${pp.amount}` : `${pp.currency} ${pp.amount}`) : "Free",
          whoItsFor: pc?.whoItsFor?.[0] || v.subtitle || "",
          highlights: (pc?.learningOutcomes || []).slice(0, 3),
          heroUrl,
          fromDb: true,
        });
      }
      return cards;
    }
  } catch {
    /* fall through to static fallback */
  }

  // Fallback: use static videoLessons from content.ts
  return videoLessons.map((l) => {
    const detail = videoDetailFallbacks.find((d) => d.slug === l.slug);
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      category: l.category,
      duration: l.duration,
      price: l.investment,
      whoItsFor: detail?.whoItsFor?.[0] || l.summary,
      highlights: detail?.learningOutcomes?.slice(0, 3) || l.highlights,
      heroUrl: VIDEO_HERO_PLACEHOLDER_BY_SLUG[l.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT,
      fromDb: false,
    };
  });
}

async function safeGetCourses() {
  try { return await getCourses(); } catch { return []; }
}
async function safeGetQuizzes() {
  try { return await getPublicQuizzes(); } catch { return []; }
}

async function safeGetWorkshops(): Promise<WorkshopCard[]> {
  try {
    const workshops = await getWorkshops();
    if (workshops.length > 0) {
      return workshops.map((workshop: any) => ({
        id: workshop.id,
        slug: workshop.slug,
        title: workshop.title,
        summary: workshop.summary || workshop.headline || "",
        duration: workshop.duration || "In-person",
        investment: workshop.investment || "Enquire",
        location: workshop.location || "Location on request",
        outcomes: workshop.outcomes ?? [],
      }));
    }
  } catch {
    // Fall through to static fallback cards.
  }

  return inPersonIntensives.map((programme) => ({
    id: programme.id,
    slug: programme.slug,
    title: programme.title,
    summary: programme.summary,
    duration: programme.duration,
    investment: programme.investment,
    location: programme.location,
    outcomes: programme.outcomes,
  }));
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

export default async function Education() {
  const [courses, publicQuizzes, videos, workshops, session, freeSignupVideo] = await Promise.all([
    safeGetCourses(),
    safeGetQuizzes(),
    getVideos(),
    safeGetWorkshops(),
    getCurrentSession(),
    getFreeSignupVideoPromo(),
  ]);

  const featuredWorkshops = selectFeaturedWorkshops(workshops, []);

  const proCourseRaw = courses.filter(
    (c) => c.slug !== "academy-quizzes"
  );

  const professionalCourses = await Promise.all(
    proCourseRaw.map(async (c) => {
      let heroUrl: string | null = null;
      if ((c as any).heroMedia?.path) {
        try { heroUrl = await createSignedDownloadUrl((c as any).heroMedia.path); }
        catch { /* fall through */ }
      }
      if (!heroUrl) {
        heroUrl = ((c as any).meta as Record<string, any>)?.heroImage ?? null;
      }
      return { ...c, heroUrl };
    })
  );

  return (
    <main className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-salmon/[0.04]" />
        <div className="absolute -left-24 top-48 h-72 w-72 rounded-full bg-brand-sage/[0.04]" />

        <Container className="relative pb-10 pt-16 sm:pb-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">
                Education
              </span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                Professional trichology education.
                <br />
                Built on 18 years of clinical experience.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-brand-graphite/65">
                Video courses, structured training programs, and hands-on workshops &mdash; designed by Lorraine Hawkins to give hair professionals real clinical confidence.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <ButtonLink href="#courses" size="lg" variant="primary">
                  View Training Courses
                </ButtonLink>
                <ButtonLink href="/education/videos" variant="ghost" size="lg" icon={<span aria-hidden>&rarr;</span>}>
                  Video Courses
                </ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { value: "18+", label: "Years practice" },
                  { value: "2,400+", label: "Learners trained" },
                  { value: "Evidence", label: "Based approach" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-brand-graphite/8 bg-white p-3 text-center">
                    <p className="font-display text-lg text-brand-graphite">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-brand-graphite/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={photography.hero.src}
                  alt="Lorraine Hawkins — clinical trichologist and educator."
                  width={600} height={780}
                  className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {freeSignupVideo ? <FreeAcademyVideoPromoSection lead={freeSignupVideo} /> : null}

      {/* ── Message from Lorraine ────────────────────────────────────────── */}
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
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">A message from Lorraine</p>
              <blockquote className="text-base leading-relaxed text-brand-graphite/75 italic">
                &ldquo;I&rsquo;ve spent nearly two decades working with clients and training practitioners. Everything I teach comes from what I&rsquo;ve seen in clinic &mdash; real presentations, real outcomes, real conversations. My goal is to give you the clinical knowledge and confidence to deliver exceptional care.&rdquo;
              </blockquote>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-brand-graphite">Lorraine Hawkins</p>
                <p className="text-xs text-brand-graphite/50">Fellow, Institute of Trichologists &middot; Clinical Educator</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Video Courses ─────────────────────────────────────── */}
      <section className="py-10 sm:py-14" id="video-courses">
        <Container>
          <div className="mb-8 max-w-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">
              Video Courses
            </span>
            <h2 className="font-display text-2xl text-brand-graphite sm:text-3xl">
              Condition-specific clinical training
            </h2>
            <p className="text-sm leading-relaxed text-brand-graphite/60">
              Focused modules on the conditions your clients present with most. Deepen your clinical knowledge and confidently support every consultation.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {videos.map((video) => {
              const accent = getTopicAccent(video.category);
              return (
                <Link
                  key={video.id}
                  href={`/education/videos/${video.slug}`}
                  className="group block"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-lg hover:border-brand-graphite/15">
                    {/* Hero image or gradient placeholder */}
                    <div className="relative h-36 overflow-hidden">
                      {video.heroUrl ? (
                        <>
                          <Image
                            src={video.heroUrl}
                            alt={video.title}
                            width={600}
                            height={300}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className={`flex h-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110">
                            <svg className={`h-5 w-5 ${accent.text}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                          <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${accent.bg} opacity-40`} />
                        </div>
                      )}
                      {/* Badges */}
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold text-brand-graphite shadow-sm">
                        {video.price}
                      </span>
                      <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {video.duration}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <span className={`mb-2 inline-flex self-start rounded-full ${accent.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${accent.text}`}>
                        {video.category}
                      </span>
                      <h3 className="mb-1 font-display text-base leading-snug text-brand-graphite group-hover:text-brand-salmon transition-colors">
                        {video.title}
                      </h3>
                      {video.whoItsFor && (
                        <p className="mb-3 text-xs leading-relaxed text-brand-graphite/55 line-clamp-2">
                          {video.whoItsFor}
                        </p>
                      )}
                      {video.highlights.length > 0 && (
                        <ul className="mt-auto space-y-1">
                          {video.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-brand-graphite/50">
                              <span className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-brand-sage/12 text-[7px] font-bold text-brand-sage">&#10003;</span>
                              <span className="line-clamp-1">{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <ButtonLink href="/education/videos" variant="ghost" size="sm">
              View all video courses &rarr;
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Quizzes ────────────────────────────────────────────────────── */}
      {publicQuizzes.length > 0 && (
        <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/20 via-brand-sand/30 to-white py-10 sm:py-12" id="assessments">
          <Container>
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-mist">
                Quick check
              </span>
              <h2 className="mt-1 font-display text-2xl text-brand-graphite">
                Test your knowledge
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-brand-graphite/60">
                Free quizzes with personalised recommendations based on your results.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-brand-mist/30 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-mist/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist/15">
                      <svg className="h-4 w-4 text-brand-mist" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-mist">
                      {quiz._count?.questions ?? 0} questions &middot; Free
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-brand-graphite group-hover:text-brand-salmon transition-colors">
                    <Link href={`/quiz/${quiz.slug}`}>{quiz.title}</Link>
                  </h3>
                  {quiz.description && (
                    <p className="text-sm leading-relaxed text-brand-graphite/60 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  <ButtonLink
                    href={`/quiz/${quiz.slug}`}
                    variant="secondary"
                    size="sm"
                    className="mt-auto w-full justify-center"
                  >
                    Take quiz &rarr;
                  </ButtonLink>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Training Courses ───────────────────────────────────────── */}
      <section className="py-10 sm:py-14" id="courses">
        <Container>
          <div className="mb-8 max-w-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-sage">
              Training Courses
            </span>
            <h2 className="font-display text-2xl text-brand-graphite sm:text-3xl">
              Structured programs that build clinical confidence
            </h2>
            <p className="text-sm leading-relaxed text-brand-graphite/60">
              Comprehensive online courses for trichologists, stylists, and clinic teams. Gain structured clinical frameworks, consultation skills, and evidence-based treatment knowledge.
            </p>
          </div>

          {professionalCourses.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionalCourses.map((course) => {
                const primaryPrice = course.pricing.find((p) => p.isPrimary) || course.pricing[0];
                const priceLabel = primaryPrice
                  ? primaryPrice.currency === "GBP"
                    ? `\u00A3${primaryPrice.amount}`
                    : `${primaryPrice.currency} ${primaryPrice.amount}`
                  : "Enquire";
                const duration = course.durationMinutes ? `${course.durationMinutes} mins` : "Self-paced";
                const targetAudience = (course as { targetAudience?: string[] }).targetAudience ?? [];
                const prereqs = (course as { prerequisites?: Array<{ requiredCourse: { title: string } }> }).prerequisites ?? [];
                const forLabel = targetAudience.length > 0 ? targetAudience[0] : null;
                const requiresLabel = prereqs.length > 0 ? prereqs.map((p) => p.requiredCourse.title).join(", ") : null;
                const courseMeta = (course.meta ?? {}) as Record<string, unknown>;
                const hasLaunchOffer = !!courseMeta?.launchOffer;

                return (
                  <Link
                    key={course.id}
                    href={`/education/${course.slug}`}
                    className="group block h-full"
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-sage/15 bg-white shadow-sm transition-all hover:shadow-lg hover:border-brand-sage/30">
                      {/* Hero image or sage gradient */}
                      <div className="relative h-36 overflow-hidden">
                        {course.heroUrl ? (
                          <>
                            <Image
                              src={course.heroUrl}
                              alt={course.title}
                              width={600}
                              height={300}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-sage/10 via-brand-sage/5 to-brand-sand/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110">
                              <svg className="h-5 w-5 text-brand-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Price badge + optional Launch offer */}
                        <span className="absolute right-3 top-3 flex items-center gap-1.5">
                          {hasLaunchOffer && (
                            <span className="rounded-full bg-brand-salmon/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Launch offer
                            </span>
                          )}
                          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold text-brand-graphite shadow-sm">
                            {priceLabel}
                          </span>
                        </span>
                        <span className="absolute left-3 top-3 rounded-full bg-brand-sage/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-graphite/60 backdrop-blur-sm">
                          {course.level || "Course"}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-brand-graphite/40">
                            {course.modules.length} modules &middot; {duration}
                          </span>
                        </div>
                        <h3 className="font-display text-lg leading-snug text-brand-graphite group-hover:text-brand-sage transition-colors">
                          {course.title}
                        </h3>
                        {forLabel && (
                          <p className="text-xs text-brand-graphite/55 line-clamp-1">
                            <span className="font-semibold text-brand-graphite/70">For:</span> {forLabel}
                          </p>
                        )}
                        {requiresLabel && (
                          <p className="text-xs text-brand-graphite/50 line-clamp-1">
                            <span className="font-semibold text-brand-graphite/60">Requires:</span> {requiresLabel}
                          </p>
                        )}
                        <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60 line-clamp-2">
                          {course.subtitle || course.description}
                        </p>
                        {primaryPrice ? (
                          <PurchaseButton
                            courseId={course.id}
                            priceId={primaryPrice.id}
                            amount={Number(primaryPrice.amount)}
                            currency={primaryPrice.currency}
                            courseSlug={course.slug}
                            isLoggedIn={!!session}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-sage">
                            View details <span aria-hidden>&rarr;</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* ── In-person workshops ─────────────────────────────────────────── */}
      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/15 via-brand-sand/20 to-white py-10 sm:py-12" id="workshops">
        <Container>
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/40">
              In-person
            </span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">
              Hands-on training led by Lorraine
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-graphite/60">
              London studio or at your location worldwide.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWorkshops.map((programme, idx) => (
              <Link
                key={programme.id}
                href={`/education/workshops/${programme.slug}`}
                className="group block h-full"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white shadow-sm transition-all hover:shadow-md hover:border-brand-sage/30">
                  {/* Numbered header */}
                  <div className="flex items-center gap-3 border-b border-brand-graphite/6 bg-brand-sand/30 px-5 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-graphite/10 text-xs font-bold text-brand-graphite">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-brand-graphite group-hover:text-brand-sage transition-colors">{programme.title}</p>
                      <p className="text-[10px] text-brand-graphite/45">{programme.duration} &middot; {programme.investment}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-sm leading-relaxed text-brand-graphite/65">{programme.summary}</p>
                    <p className="text-[11px] text-brand-graphite/40">{programme.location}</p>
                    <ul className="space-y-1.5">
                      {programme.outcomes.slice(0, 3).map((o) => (
                        <li key={o} className="flex gap-2 text-xs text-brand-graphite/55">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-sage/50" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-sage">
                      View details <span aria-hidden>&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Condition Reference Library ─────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-graphite/8 bg-white px-6 py-8 text-center shadow-sm sm:flex-row sm:text-left">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-mist/15">
              <svg className="h-6 w-6 text-brand-mist" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </span>
            <div className="flex-1">
              <h3 className="font-display text-lg text-brand-graphite">Condition Reference Library</h3>
              <p className="text-sm text-brand-graphite/55">
                Clear, evidence-based information on common hair and scalp conditions. Free to read.
              </p>
            </div>
            <ButtonLink href="/education/conditions" variant="ghost" size="sm">
              Browse conditions &rarr;
            </ButtonLink>
          </div>
        </Container>
      </section>

      <FaqSection />
      <TestimonialsSection />
      <ConsultationCta />
    </main>
  );
}
