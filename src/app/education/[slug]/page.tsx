import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { getCourseBySlug } from "@/app/actions/education";
import { CurriculumAccordion } from "@/components/education/CurriculumAccordion";
import { ArticleCta } from "@/components/sections/ArticleCta";
import { photography } from "@/lib/visualAssets";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { prisma } from "@/server/db/client";
import { Prisma } from "@prisma/client";
import { resolveQuizCardImageUrl } from "@/server/modules/education/quizHero";

export const dynamic = "force-dynamic";

async function getCourseQuizzes(courseId: string) {
  try {
    return await prisma.quiz.findMany({
      where: { courseId, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        description: true,
        passingScore: true,
        cardImageUrl: true,
        heroMedia: { select: { path: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      return [];
    }
    throw err;
  }
}

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="#fab826" fillOpacity="0.2" />
    <path d="M6 10L9 13L14 7" stroke="#b67400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MeetLorraine = () => (
  <Surface variant="card" padding="lg" className="space-y-4">
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#fab826]/20 bg-[#fab826]/10">
        <Image
          src={photography.hero.src}
          alt="Lorraine Hawkins"
          fill
          sizes="64px"
          className="object-cover object-top"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-black">Lorraine Hawkins</h3>
        <p className="text-xs uppercase tracking-widest text-[#b67400]">Lead Trichologist & Educator</p>
      </div>
    </div>
    <p className="text-sm leading-relaxed text-black/70 italic">
      "With over 20 years of clinical experience, I've designed this course to bridge the gap between complex science and practical application. My goal is to empower you with the rigor and empathy needed for exceptional care."
    </p>
  </Surface>
);

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const [quizzesRaw, enrollmentCount] = await Promise.all([
    getCourseQuizzes(course.id),
    prisma.enrollment.count({ where: { courseId: course.id, status: "ACTIVE" } }),
  ]);

  const quizzes = await Promise.all(
    quizzesRaw.map(async (q) => ({
      ...q,
      heroUrl: await resolveQuizCardImageUrl(q),
    })),
  );

  const primaryPrice = course.pricing.find((p: any) => p.isPrimary) || course.pricing[0];
  const courseMeta = (course.meta ?? {}) as Record<string, unknown>;
  const launchOffer = courseMeta.launchOffer as { amount?: number; standardAmount?: number } | undefined;
  const priceLabel = primaryPrice
    ? primaryPrice.currency === "GBP"
      ? `£${primaryPrice.amount}`
      : `${primaryPrice.currency} ${primaryPrice.amount}`
    : "Free";
  const priceSubline = launchOffer?.standardAmount != null
    ? `Usually £${launchOffer.standardAmount}`
    : null;
  const duration = course.durationMinutes ? `${course.durationMinutes} mins` : "Self-paced";

  let heroUrl: string | null = null;
  if (course.heroMedia?.path) {
    try { heroUrl = await createSignedDownloadUrl(course.heroMedia.path); } catch { /* use null */ }
  }

  const outcomes = (course as any).learningOutcomes ?? [];
  const requirements = (course as any).requirements ?? [];
  const audience = (course as any).targetAudience ?? [];
  const faqs = (course as any).faqs ?? [];
  const hasLiveCohorts = (course.sessions?.length ?? 0) > 0;
  const prerequisites: Array<{ requiredCourse: { id: string; slug: string; title: string } }> = (course as any).prerequisites ?? [];
  const hasRightForYou = prerequisites.length > 0 || audience.length > 0 || requirements.length > 0;

  const totalLessons = (course.modules ?? []).reduce(
    (sum: number, m: any) => sum + (m.lessons?.length ?? 0),
    0
  );
  const totalDownloads = (course.downloads?.length ?? 0) +
    (course.modules ?? []).reduce(
      (sum: number, m: any) =>
        sum + (m.lessons ?? []).filter((l: any) => l.downloadableId).length,
      0
    );
  const hasVideos = (course.modules ?? []).some((m: any) =>
    (m.lessons ?? []).some((l: any) => l.videoUrl)
  );

  return (
    <main>
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:items-start">
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <SectionHeading
                eyebrow={course.category || "Education"}
                title={course.title}
                description={course.subtitle ?? course.description ?? "Course details"}
              />
              <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.32em] text-black/50">
                <span className="rounded-full bg-white/50 px-3 py-1 border border-black/5">{duration}</span>
                <span className="text-black/20">/</span>
                <span className="rounded-full bg-white/50 px-3 py-1 border border-black/5">{priceLabel}</span>
                <span className="text-black/20">/</span>
                <span className="rounded-full bg-white/50 px-3 py-1 border border-black/5">{String(course.enrollmentType).replace(/_/g, " ")}</span>
              </div>
              {hasLiveCohorts ? (
                <p className="text-xs uppercase tracking-[0.22em] text-black/45">
                  Available online <span className="text-black/25">+</span> live cohorts
                </p>
              ) : null}
            </div>

            {/* Is this course right for you? — prerequisites, who it's for, requirements */}
            {hasRightForYou && (
              <Surface variant="card" padding="lg" className="space-y-6 border-l-4 border-[#fab826]">
                <h2 className="text-xs uppercase tracking-[0.3em] text-black/40 font-bold">Is this course right for you?</h2>
                {prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-black/80">Before enrolling, you should have completed</h3>
                    <ul className="flex flex-wrap gap-2">
                      {prerequisites.map((p: { requiredCourse: { slug: string; title: string } }) => (
                        <li key={p.requiredCourse.slug}>
                          <Link
                            href={`/education/${p.requiredCourse.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#fab826]/15 px-3 py-1.5 text-sm font-medium text-[#b67400] transition hover:bg-[#fab826]/25"
                          >
                            {p.requiredCourse.title}
                            <span aria-hidden>→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {audience.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-black/80">Who this is for</h3>
                    <ul className="space-y-1.5">
                      {audience.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-black/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#fab826]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {requirements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-black/80">What you need</h3>
                    <ul className="space-y-1.5">
                      {requirements.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-black/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Surface>
            )}

            {/* Learning Outcomes */}
            {outcomes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-black/40 font-bold">What you&apos;ll master</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {outcomes.map((outcome: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/40 p-4 transition-colors hover:bg-white/60">
                      <div className="mt-0.5 shrink-0"><CheckIcon /></div>
                      <p className="text-sm font-medium text-black/80">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <Surface variant="card" padding="lg" className="space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h2 className="text-xl font-semibold text-black">Course Curriculum</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-black/30">
                  {course.modules?.length ?? 0} Modules &middot; {totalLessons} Lessons
                </span>
              </div>
              <CurriculumAccordion
                modules={(course.modules ?? []).map((m: any, idx: number) => ({
                  id: m.id,
                  index: idx,
                  title: m.title,
                  description: m.description ?? null,
                  lessons: (m.lessons ?? []).map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    hasVideo: !!l.videoUrl,
                    hasDownload: !!l.downloadableId,
                  })),
                }))}
              />
              {(course.modules ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-black/50 italic">Curriculum content is being updated.</p>
              )}
            </Surface>

            {/* Quizzes */}
            {quizzes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-black/40 font-bold">Certification Quizzes</h2>
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      href={`/academy/quizzes/${quiz.id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-[#fab826]/5 px-4 py-3 transition-all hover:bg-[#fab826]/10 hover:border-[#fab826]/20 sm:px-6 sm:py-4"
                    >
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-black/5">
                        {quiz.heroUrl ? (
                          <Image
                            src={quiz.heroUrl}
                            alt={quiz.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-[#b67400]/40">
                            Quiz
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-black group-hover:text-[#b67400] transition-colors">{quiz.title}</p>
                        <p className="text-xs text-black/50">
                          {quiz._count.questions} questions · Requires {quiz.passingScore}% to pass
                        </p>
                      </div>
                      <span className="shrink-0 text-xl text-[#fab826] transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-black/40 font-bold">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {faqs.map((faq: any, i: number) => (
                    <Surface key={i} variant="card" padding="md" className="space-y-2">
                      <p className="font-bold text-sm text-black">{faq.question}</p>
                      <p className="text-sm text-black/60 leading-relaxed">{faq.answer}</p>
                    </Surface>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sticky top-24 space-y-6">
            {heroUrl ? (
              <Surface variant="glass" padding="none" className="aspect-square overflow-hidden rounded-glass-lg border border-white/20 shadow-2xl shadow-[#fab826]/5">
                <Image
                  src={heroUrl}
                  alt={course.title}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              </Surface>
            ) : (
              <div className="aspect-square rounded-glass-lg bg-[#fab826]/10 border-2 border-dashed border-[#fab826]/20 flex items-center justify-center p-8 text-center">
                <p className="text-sm text-[#b67400]/60 uppercase tracking-widest font-bold">Visual Preview<br/>Coming Soon</p>
              </div>
            )}

            <Surface variant="card" padding="lg" className="space-y-6 border-t-4 border-[#fab826]">
              <div className="space-y-2 text-center">
                {priceSubline ? (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#b67400] font-bold">Launch offer</p>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.4em] text-black/40 font-bold">Instant Enrollment</p>
                )}
                <div className="text-3xl font-bold text-black">{priceLabel}</div>
                {priceSubline && (
                  <p className="text-sm text-black/50">{priceSubline}</p>
                )}
                {enrollmentCount > 0 && (
                  <p className="text-xs text-black/50">
                    {enrollmentCount} {enrollmentCount === 1 ? "learner" : "learners"} enrolled
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Link
                  href={`/education/checkout/${course.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#fab826] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
                >
                  Start Course
                </Link>
              </div>

              {/* What's Included */}
              <div className="space-y-3 border-t border-black/5 pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-bold">What&apos;s included</p>
                <ul className="space-y-2.5">
                  {totalLessons > 0 && (
                    <li className="flex items-center gap-3 text-sm text-black/70">
                      <svg className="h-4 w-4 shrink-0 text-[#b67400]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                      <span>{totalLessons} structured lessons</span>
                    </li>
                  )}
                  {hasVideos && (
                    <li className="flex items-center gap-3 text-sm text-black/70">
                      <svg className="h-4 w-4 shrink-0 text-[#b67400]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      <span>{duration} of video content</span>
                    </li>
                  )}
                  {totalDownloads > 0 && (
                    <li className="flex items-center gap-3 text-sm text-black/70">
                      <svg className="h-4 w-4 shrink-0 text-[#b67400]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                      <span>{totalDownloads} downloadable {totalDownloads === 1 ? "resource" : "resources"}</span>
                    </li>
                  )}
                  {quizzes.length > 0 && (
                    <li className="flex items-center gap-3 text-sm text-black/70">
                      <svg className="h-4 w-4 shrink-0 text-[#b67400]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      <span>{quizzes.length} graded {quizzes.length === 1 ? "quiz" : "quizzes"}</span>
                    </li>
                  )}
                  <li className="flex items-center gap-3 text-sm text-black/70">
                    <svg className="h-4 w-4 shrink-0 text-[#b67400]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    <span>Lifetime access &amp; updates</span>
                  </li>
                </ul>
              </div>

              <p className="text-center text-[10px] text-black/35 leading-relaxed px-4">
                30-day money-back guarantee. No questions asked.
              </p>
            </Surface>

            {/* Bundle CTA for Phase 1 + Clinical Practice */}
            {(course.slug === "trichocare-phase-1" || course.slug === "trichology-clinical-practice") && (
              <Link
                href="/education/checkout/bundle/phase-1-clinical-practice"
                className="block rounded-2xl border-2 border-[#b67400]/30 bg-[#fab826]/10 px-5 py-4 text-center transition hover:border-[#b67400]/50 hover:bg-[#fab826]/15"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b67400]">
                  Bundle and save
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  {course.slug === "trichocare-phase-1"
                    ? "Add Trichology in Clinical Practice"
                    : "Add Hair & Scalp Foundation Phase 1"}
                  {" "}— £700 for both
                </p>
              </Link>
            )}

            <MeetLorraine />

            <div className="rounded-2xl bg-black px-6 py-6 text-white space-y-3 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Secure Checkout</p>
              <p className="text-sm text-white/80 leading-relaxed">
                Payments are processed securely via Stripe. Your card details are never stored on our servers.
              </p>
              <div className="flex items-center gap-3">
                <svg className="h-8 w-auto text-white/40" viewBox="0 0 38 24" fill="currentColor"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3Zm-2.7 18.4h-3l1.9-11.8h3l-1.9 11.8Zm-7.4 0-2.8-8.1-.3 1.7-.3 1.4s-.1.3-.1.5l-1 6.5h-3.2l4.7-11.8h3.3l2 11.8h-3.3Zm-10 0H11l3-11.8h3.9l-3 11.8ZM10 11.2l-.4-1.8-.3-.7-.2-.5s-.2-.3-.2-.4C8.5 7.1 7.8 6.6 7.1 6.6h-5l-.1.3c1 .3 1.9.6 2.7 1.1l2.8 8.4h3.2l4.8-11.8H12L10 11.2Z" /></svg>
                <svg className="h-8 w-auto text-white/40" viewBox="0 0 38 24" fill="currentColor"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3Z" fillOpacity="0.07" /><circle cx="15" cy="12" r="7" fillOpacity="0.5" /><circle cx="23" cy="12" r="7" fillOpacity="0.35" /></svg>
                <svg className="h-5 w-auto text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      <ArticleCta category="Professional Development" />

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-xs text-black/50 leading-tight">{course.title}</p>
          </div>
          <Link
            href={`/education/checkout/${course.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#fab826] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
          >
            Start Course
          </Link>
        </div>
      </div>
    </main>
  );
}
