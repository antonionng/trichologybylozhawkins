'use client';

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import { Surface } from "@/components/layout/Surface";

export function ConsultationCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageSection tone="graphite" texture="linen" padding="compact" className="relative">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6 text-brand-graphite">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-graphite/60">Get started</span>
          <h2 className="font-display text-3xl leading-snug">
            Ready for expert guidance on your scalp health journey?
          </h2>
          <p className="text-sm leading-relaxed text-brand-graphite/75">
            Get a professional scalp assessment, personalized treatment plan, and ongoing support. Whether for yourself or your salon team, Lorraine provides clear next steps.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Book a consultation
            </ButtonLink>
            <ButtonLink href="/services" variant="ghost" size="lg">
              View all services
            </ButtonLink>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion ? undefined : { duration: 0.8, ease: [0.25, 0.95, 0.45, 1] }
          }
          viewport={{ once: true, margin: "-10%" }}
          className="relative"
        >
          <Surface variant="glass" padding="none" className="overflow-hidden backdrop-blur-lg">
            <Image
              src={photography.consultation.src}
              alt={photography.consultation.alt}
              width={720}
              height={540}
              className="h-full w-full object-cover saturate-[0.9]"
              sizes="(max-width: 1024px) 100vw, 45vw"
              loading="lazy"
            />
          </Surface>
        </motion.div>
      </Container>
    </PageSection>
  );
}

