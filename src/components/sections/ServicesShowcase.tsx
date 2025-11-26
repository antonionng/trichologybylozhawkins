'use client';

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Surface } from "@/components/layout/Surface";
import { services } from "@/lib/content";

export function ServicesShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageSection tone="mist" texture="veined" className="relative">
      <Container className="space-y-16">
        <SectionHeading
          eyebrow="Services"
          title="Expert care and professional training"
          description="From personal consultations to team training, every service combines scientific expertise with practical, real-world application."
          align="center"
        />

        <div className="grid gap-12 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.6, delay: index * 0.08, ease: [0.25, 0.95, 0.45, 1] }
              }
              viewport={{ once: true, margin: "-15%" }}
              className="flex h-full flex-col gap-6"
            >
              <Surface variant="glass" padding="none" className="overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image.src}
                    alt={service.image.alt}
                    fill
                    className="object-cover saturate-[0.95]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-graphite/85 to-transparent" />
                  <div className="absolute left-6 bottom-6 rounded-full bg-brand-ivory/85 px-3 py-1 text-xs uppercase tracking-[0.3em] text-brand-graphite">
                    {service.duration}
                  </div>
                </div>
              </Surface>

              <Surface variant="card" padding="md" className="flex h-full flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h3 className="font-display text-2xl text-brand-graphite">{service.name}</h3>
                  <p className="text-sm leading-relaxed text-brand-graphite/75">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-brand-sage/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-brand-graphite/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <ButtonLink href={service.cta.href} variant="ghost" size="sm" icon={<span aria-hidden>↗</span>}>
                  {service.cta.label}
                </ButtonLink>
              </Surface>
            </motion.article>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}

