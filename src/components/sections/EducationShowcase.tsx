'use client';

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Surface } from "@/components/layout/Surface";
import { inPersonIntensives, videoLessons } from "@/lib/content";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: index * 0.08,
      ease: [0.25, 0.95, 0.45, 1],
    },
  }),
};

export function EducationShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const showcaseItems = [
    ...videoLessons.slice(0, 2).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subtitle: `${lesson.duration} · ${lesson.investment}`,
      summary: lesson.summary,
      highlights: lesson.highlights.slice(0, 2),
      image: lesson.image,
      href: `/education?purchase=${lesson.slug}`,
      badge: "Video Lesson",
      badgeTone: "bg-brand-salmon/60 text-brand-ivory",
      ctaLabel: "Download for £35",
    })),
    ...inPersonIntensives.slice(0, 1).map((programme) => ({
      id: programme.id,
      title: programme.title,
      subtitle: `${programme.duration} · ${programme.investment}`,
      summary: programme.summary,
      highlights: programme.outcomes.slice(0, 2),
      image: programme.image,
      href: `/contact?intensive=${programme.slug}`,
      badge: "In-person Intensive",
      badgeTone: "bg-brand-graphite/10 text-brand-graphite",
      ctaLabel: "Reserve dates",
    })),
  ];

  return (
    <PageSection padding="default" tone="transparent" className="relative">
      <Container className="space-y-16">
        <SectionHeading
          eyebrow="Education"
          title="Professional training for real results"
          description="Learn proven methods through video courses you can start today or hands-on workshops led by Lorraine."
          align="center"
        />

        <div className="grid gap-10 lg:grid-cols-3">
          {showcaseItems.map((item, index) => (
            <motion.article
              key={item.id}
              variants={cardVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={{ once: true, margin: "-10%" }}
              custom={index}
            >
              <Surface variant="card" padding="none" className="overflow-hidden backdrop-blur-sm">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    className="object-cover transition duration-700 ease-glide hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite/70 via-transparent to-transparent" />
                  <div
                    className={`absolute left-0 top-0 m-6 inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em] ${item.badgeTone}`}
                  >
                    {item.badge}
                  </div>
                </div>

                <div className="space-y-5 p-7">
                  <header className="space-y-3">
                    <h3 className="font-display text-2xl leading-snug text-brand-graphite">{item.title}</h3>
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-graphite/55">{item.subtitle}</p>
                    <p className="text-sm leading-relaxed text-brand-graphite/75">{item.summary}</p>
                  </header>

                  <ul className="space-y-2 text-sm text-brand-graphite/70">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-5 rounded-full bg-brand-salmon/80" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <ButtonLink href={item.href} variant="ghost" size="sm" className="mt-4 w-fit">
                    {item.ctaLabel}
                  </ButtonLink>
                </div>
              </Surface>
            </motion.article>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}

