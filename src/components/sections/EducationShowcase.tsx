'use client';

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { videoLessons, inPersonIntensives, VIDEO_HERO_PLACEHOLDER_BY_SLUG, VIDEO_HERO_PLACEHOLDER_DEFAULT } from "@/lib/content";
import { getTopicAccent } from "@/lib/topicAccents";

/* ──────────────────────────────────────────────────────────────────────────
 * Props — when the homepage passes DB data we use it; otherwise fallback
 * to the hardcoded arrays from content.ts.
 * ────────────────────────────────────────────────────────────────────────── */

export type VideoRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  durationMinutes: number | null;
  publicContent: any;
  price: number | null;
  heroUrl?: string | null;
};

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  level: string;
  durationMinutes: number | null;
  moduleCount: number;
  price: number | null;
  heroUrl?: string | null;
};

type Props = {
  videos?: VideoRow[];
  courses?: CourseRow[];
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: index * 0.08, ease: [0.25, 0.95, 0.45, 1] },
  }),
};

export function EducationShowcase({ videos, courses }: Props) {
  const shouldReduceMotion = useReducedMotion();

  // ── Resolve data (DB or fallback) ──────────────────────────────────────

  const videoCards =
    videos && videos.length > 0
      ? videos.slice(0, 3).map((v) => ({
          id: v.id,
          title: v.title,
          subtitle:
            [v.durationMinutes ? `${v.durationMinutes} mins` : null, v.price ? `£${v.price}` : null]
              .filter(Boolean)
              .join(" · ") || "Self-paced",
          summary:
            (v.publicContent as any)?.whoItsFor?.[0] ||
            v.subtitle ||
            "Short, focused video course by Lorraine.",
          href: `/education/videos/${v.slug}`,
          badge: v.category || "Video Course",
          heroUrl: v.heroUrl || VIDEO_HERO_PLACEHOLDER_BY_SLUG[v.slug] || VIDEO_HERO_PLACEHOLDER_DEFAULT,
        }))
      : videoLessons.slice(0, 3).map((l) => ({
          id: l.id,
          title: l.title,
          subtitle: `${l.duration} · ${l.investment}`,
          summary: l.summary,
          href: `/education/videos/${l.slug}`,
          badge: l.category,
          heroUrl: VIDEO_HERO_PLACEHOLDER_BY_SLUG[l.slug] || VIDEO_HERO_PLACEHOLDER_DEFAULT,
        }));

  const courseCards =
    courses && courses.length > 0
      ? courses.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle:
            [c.level, c.moduleCount ? `${c.moduleCount} modules` : null, c.price ? `£${c.price}` : null]
              .filter(Boolean)
              .join(" · "),
          summary: c.subtitle || "Structured trichology training.",
          href: `/education/${c.slug}`,
          badge: c.level || "Course",
          heroUrl: c.heroUrl || null,
        }))
      : inPersonIntensives.slice(0, 2).map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: `${p.duration} · ${p.investment}`,
          summary: p.summary,
          href: `/contact?intensive=${p.slug}`,
          badge: "In-Person",
          heroUrl: null as string | null,
        }));

  return (
    <PageSection padding="compact" tone="transparent" className="relative">
      <Container className="space-y-12">
        {/* ── Row 1: Video Courses ─────────────────── */}
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Video Courses"
            title="Condition-Specific Clinical Training"
            description="Focused video modules on the conditions your clients present with most. Deepen your clinical knowledge and confidently guide every consultation."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videoCards.map((card, index) => {
              const accent = getTopicAccent(card.badge);
              return (
                <motion.article
                  key={card.id}
                  variants={cardVariants}
                  initial={shouldReduceMotion ? false : "hidden"}
                  whileInView={shouldReduceMotion ? undefined : "visible"}
                  viewport={{ once: true, margin: "-10%" }}
                  custom={index}
                >
                  <Link href={card.href} className="group block h-full">
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-lg hover:border-brand-graphite/15">
                      {/* Hero image or gradient */}
                      <div className="relative h-36 overflow-hidden">
                        {card.heroUrl ? (
                          <>
                            <Image src={card.heroUrl} alt={card.title} width={600} height={300} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </>
                        ) : (
                          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110">
                              <svg className={`h-4 w-4 ${accent.text}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <span className={`absolute left-3 top-3 rounded-full ${accent.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${accent.text}`}>
                          {card.badge}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h3 className="font-display text-lg leading-snug text-brand-graphite group-hover:text-brand-salmon transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-brand-graphite/45">
                          {card.subtitle}
                        </p>
                        <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60 line-clamp-2">
                          {card.summary}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-salmon">
                          Learn more <span aria-hidden>&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>

          <div className="text-center">
            <ButtonLink href="/education/videos" variant="ghost" size="sm">
              View all video courses &rarr;
            </ButtonLink>
          </div>
        </div>

        {/* ── Row 2: Training Programs ────────────── */}
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Training Programs"
            title="Structured Courses and Workshops"
            description="Comprehensive training programs for trichologists, stylists, and salon teams. Online courses and in-person workshops led by Lorraine."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courseCards.map((card, index) => (
              <motion.article
                key={card.id}
                variants={cardVariants}
                initial={shouldReduceMotion ? false : "hidden"}
                whileInView={shouldReduceMotion ? undefined : "visible"}
                viewport={{ once: true, margin: "-10%" }}
                custom={index}
              >
                <Link href={card.href} className="group block h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-lg hover:border-brand-graphite/15">
                    {/* Hero image or sage gradient */}
                    <div className="relative h-32 overflow-hidden">
                      {card.heroUrl ? (
                        <>
                          <Image src={card.heroUrl} alt={card.title} width={600} height={300} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-sage/10 via-brand-sage/5 to-brand-sand/20">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                            <svg className="h-4 w-4 text-brand-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-brand-sage/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-graphite/60 backdrop-blur-sm">
                        {card.badge}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-display text-lg leading-snug text-brand-graphite group-hover:text-brand-sage transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-brand-graphite/45">
                        {card.subtitle}
                      </p>
                      <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60 line-clamp-2">
                        {card.summary}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-graphite/60">
                        View details <span aria-hidden>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}

            {/* Static CTA card for in-person training */}
            <motion.div
              variants={cardVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={{ once: true, margin: "-10%" }}
              custom={courseCards.length}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-brand-graphite/5 via-brand-sand/20 to-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <svg className="h-4 w-4 text-brand-graphite/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="inline-flex self-start rounded-full bg-brand-graphite/6 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-graphite/50">
                    In-Person
                  </span>
                  <h3 className="font-display text-lg leading-snug text-brand-graphite">
                    On-site training for your team
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60">
                    Lorraine travels to salons across the UK, Europe, and North America.
                  </p>
                  <ButtonLink href="/education/workshops" variant="ghost" size="sm">
                    Explore workshops &rarr;
                  </ButtonLink>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </PageSection>
  );
}
