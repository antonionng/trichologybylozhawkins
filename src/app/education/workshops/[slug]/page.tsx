import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import { inPersonIntensives } from "@/lib/content";
import { prisma } from "@/server/db/client";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="10" fill="#fab826" fillOpacity="0.2" />
    <path
      d="M6 10L9 13L14 7"
      stroke="#b67400"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IncludedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 8L6 12L14 4"
      stroke="#28577F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QuoteIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 17.5C5 14.5 6.5 10 11 7.5L10 6C4 9 2.5 14 2.5 17.5C2.5 21 4 23 6.5 23C8.5 23 10 21.5 10 19.5C10 17.5 8.5 16 6.5 16C6 16 5.5 16.2 5 16.5V17.5ZM17 17.5C17 14.5 18.5 10 23 7.5L22 6C16 9 14.5 14 14.5 17.5C14.5 21 16 23 18.5 23C20.5 23 22 21.5 22 19.5C22 17.5 20.5 16 18.5 16C18 16 17.5 16.2 17 16.5V17.5Z"
      fill="#fab826"
      fillOpacity="0.3"
    />
  </svg>
);

async function getWorkshopData(slug: string) {
  try {
    const dbWorkshop = await prisma.workshop.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: { heroMedia: true },
    });

    if (dbWorkshop) {
      const heroUrl = dbWorkshop.heroMedia?.path
        ? await createSignedDownloadUrl(dbWorkshop.heroMedia.path)
        : null;

      return {
        source: "db" as const,
        title: dbWorkshop.title,
        headline: dbWorkshop.headline,
        summary: dbWorkshop.summary,
        longDescription: dbWorkshop.longDescription,
        duration: dbWorkshop.duration,
        investment: dbWorkshop.investment,
        location: dbWorkshop.location,
        outcomes: dbWorkshop.outcomes ?? [],
        whoItsFor: dbWorkshop.whoItsFor ?? [],
        whatYouGet: dbWorkshop.whatYouGet ?? [],
        agenda: (dbWorkshop.agenda ?? []) as Array<{
          title: string;
          description: string;
        }>,
        faqs: (dbWorkshop.faqs ?? []) as Array<{
          question: string;
          answer: string;
        }>,
        testimonials: (dbWorkshop.testimonials ?? []) as Array<{
          quote: string;
          author: string;
          role: string;
        }>,
        ctaLabel: dbWorkshop.ctaLabel,
        ctaHref: dbWorkshop.ctaHref,
        heroUrl,
        slug: dbWorkshop.slug,
      };
    }
  } catch {
    // DB unavailable — fall through to static data
  }

  const staticWorkshop = inPersonIntensives.find((w) => w.slug === slug);
  if (!staticWorkshop) return null;

  return {
    source: "static" as const,
    title: staticWorkshop.title,
    headline: staticWorkshop.headline,
    summary: staticWorkshop.summary,
    longDescription: staticWorkshop.longDescription,
    duration: staticWorkshop.duration,
    investment: staticWorkshop.investment,
    location: staticWorkshop.location,
    outcomes: staticWorkshop.outcomes,
    whoItsFor: staticWorkshop.whoItsFor,
    whatYouGet: staticWorkshop.whatYouGet,
    agenda: staticWorkshop.agenda,
    faqs: staticWorkshop.faqs,
    testimonials: staticWorkshop.testimonials,
    ctaLabel: staticWorkshop.ctaLabel,
    ctaHref: staticWorkshop.ctaHref,
    heroUrl: null,
    slug: staticWorkshop.slug,
  };
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const workshop = await getWorkshopData(params.slug);
  if (!workshop) notFound();

  const descriptionParagraphs = (workshop.longDescription ?? "")
    .split("\n")
    .filter(Boolean);

  const ctaHref = workshop.ctaHref || `/contact?intensive=${workshop.slug}`;
  const ctaLabel = workshop.ctaLabel || "Reserve your place";

  return (
    <main>
      {/* ── Hero Section ── */}
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-sage/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-graphite/60">
                  In-Person Training
                </span>
              </div>
              <h1 className="font-display text-3xl leading-tight text-brand-graphite sm:text-[2.8rem]">
                {workshop.title}
              </h1>
              {workshop.headline && (
                <p className="text-lg leading-relaxed text-brand-graphite/75">
                  {workshop.headline}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-brand-graphite/50">
                {workshop.duration && (
                  <span className="rounded-full bg-white/50 px-3 py-1.5 border border-black/5">
                    {workshop.duration}
                  </span>
                )}
                {workshop.investment && (
                  <>
                    <span className="text-brand-graphite/20">/</span>
                    <span className="rounded-full bg-white/50 px-3 py-1.5 border border-black/5">
                      {workshop.investment}
                    </span>
                  </>
                )}
                {workshop.location && (
                  <>
                    <span className="text-brand-graphite/20">/</span>
                    <span className="rounded-full bg-white/50 px-3 py-1.5 border border-black/5">
                      {workshop.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href={ctaHref} variant="primary" size="lg">
                {ctaLabel}
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="ghost"
                size="lg"
              >
                Have questions? Contact Lorraine
              </ButtonLink>
            </div>

            {/* Long description */}
            {descriptionParagraphs.length > 0 && (
              <div className="space-y-4 pt-4">
                {descriptionParagraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed text-brand-graphite/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="sticky top-24 space-y-6">
            {workshop.heroUrl ? (
              <Surface
                variant="glass"
                padding="none"
                className="aspect-[4/3] overflow-hidden rounded-glass-lg border border-white/20 shadow-2xl shadow-[#fab826]/5"
              >
                <Image
                  src={workshop.heroUrl}
                  alt={workshop.title}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              </Surface>
            ) : (
              <div className="aspect-[4/3] rounded-glass-lg bg-gradient-to-br from-brand-sage/10 via-brand-sand/30 to-white border-2 border-dashed border-[#fab826]/20 flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-xs text-[#b67400]/60 uppercase tracking-widest font-bold">
                    In-Person
                  </p>
                  <p className="text-xs text-[#b67400]/60 uppercase tracking-widest font-bold mt-1">
                    Training
                  </p>
                </div>
              </div>
            )}

            <Surface
              variant="card"
              padding="lg"
              className="space-y-5 border-t-4 border-[#fab826]"
            >
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-black/40 font-bold">
                  Investment
                </p>
                <div className="text-3xl font-bold text-black">
                  {workshop.investment || "Enquire"}
                </div>
                {workshop.duration && (
                  <p className="text-xs text-black/50">{workshop.duration}</p>
                )}
              </div>
              <ButtonLink
                href={ctaHref}
                variant="primary"
                size="lg"
                className="w-full justify-center"
              >
                {ctaLabel}
              </ButtonLink>
              <p className="text-center text-[10px] text-black/40 leading-relaxed px-4">
                Limited places per session. Certificate of completion included.
              </p>
            </Surface>

            {/* Meet Lorraine */}
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
                  <h3 className="text-lg font-semibold text-black">
                    Lorraine Hawkins
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-[#b67400]">
                    Lead Trichologist &amp; Educator
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-black/70 italic">
                &ldquo;I&apos;ve designed every workshop to bridge the gap
                between complex science and the real-world skills you need in
                the salon chair. My goal is to give you clinical confidence
                that your clients can feel.&rdquo;
              </p>
            </Surface>
          </div>
        </Container>
      </PageSection>

      {/* ── Learning Outcomes ── */}
      {workshop.outcomes.length > 0 && (
        <PageSection padding="default">
          <Container>
            <SectionHeading
              eyebrow="What you'll master"
              title="Walk away with real, usable skills"
              align="center"
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {workshop.outcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/60 p-4 transition-colors hover:bg-white/80"
                >
                  <div className="mt-0.5 shrink-0">
                    <CheckIcon />
                  </div>
                  <p className="text-sm font-medium text-black/80">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </PageSection>
      )}

      {/* ── Agenda ── */}
      {workshop.agenda.length > 0 && (
        <PageSection tone="mist" padding="default">
          <Container>
            <SectionHeading
              eyebrow="Your day"
              title="What we'll cover together"
              align="center"
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {workshop.agenda.map((session, idx) => (
                <Surface
                  key={idx}
                  variant="card"
                  padding="lg"
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fab826]/15 text-sm font-bold text-[#b67400]">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-black">
                      {session.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-black/65">
                    {session.description}
                  </p>
                </Surface>
              ))}
            </div>
          </Container>
        </PageSection>
      )}

      {/* ── Who It's For + What's Included ── */}
      <PageSection padding="default">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {workshop.whoItsFor.length > 0 && (
              <Surface variant="glass" padding="lg" className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black/40">
                  Who is this for?
                </h3>
                <ul className="space-y-3">
                  {workshop.whoItsFor.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-black/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fab826]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            )}
            {workshop.whatYouGet.length > 0 && (
              <Surface variant="glass" padding="lg" className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black/40">
                  What&apos;s included
                </h3>
                <ul className="space-y-3">
                  {workshop.whatYouGet.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-black/70"
                    >
                      <div className="mt-0.5 shrink-0">
                        <IncludedIcon />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            )}
          </div>
        </Container>
      </PageSection>

      {/* ── Testimonials ── */}
      {workshop.testimonials.length > 0 && (
        <PageSection tone="sand" texture="linen" padding="default">
          <Container>
            <SectionHeading
              eyebrow="From past attendees"
              title="What professionals are saying"
              align="center"
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {workshop.testimonials.map((testimonial, idx) => (
                <Surface
                  key={idx}
                  variant="card"
                  padding="lg"
                  className="space-y-4"
                >
                  <QuoteIcon />
                  <p className="text-sm leading-relaxed text-black/75 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-black/50">
                      {testimonial.role}
                    </p>
                  </div>
                </Surface>
              ))}
            </div>
          </Container>
        </PageSection>
      )}

      {/* ── FAQs ── */}
      {workshop.faqs.length > 0 && (
        <PageSection padding="default">
          <Container className="max-w-3xl">
            <SectionHeading
              eyebrow="Questions"
              title="Frequently asked questions"
              align="center"
            />
            <div className="mt-8 space-y-3">
              {workshop.faqs.map((faq, i) => (
                <Surface
                  key={i}
                  variant="card"
                  padding="md"
                  className="space-y-2"
                >
                  <p className="font-bold text-sm text-black">
                    {faq.question}
                  </p>
                  <p className="text-sm text-black/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </Surface>
              ))}
            </div>
          </Container>
        </PageSection>
      )}

      {/* ── Bottom CTA ── */}
      <PageSection tone="graphite" padding="default">
        <Container className="text-center space-y-6">
          <h2 className="font-display text-2xl text-white sm:text-3xl">
            Ready to build clinical confidence?
          </h2>
          <p className="mx-auto max-w-lg text-sm text-white/70 leading-relaxed">
            Places are limited to keep the training personal and hands-on.
            Reserve your spot now and transform how you serve your clients.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={ctaHref} variant="primary" size="lg" className="bg-[#fab826] text-[#b67400] hover:bg-[#fab826]/90">
              {ctaLabel}
            </ButtonLink>
            <ButtonLink href="/education/workshops" variant="ghost" size="lg" className="border-white/20 text-white hover:border-white/40 hover:bg-white/10">
              View all workshops
            </ButtonLink>
          </div>
        </Container>
      </PageSection>
    </main>
  );
}
