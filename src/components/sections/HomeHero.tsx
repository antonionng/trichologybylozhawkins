'use client';

import { useCallback } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { ButtonLink } from "@/components/ui/Button";
import { Surface } from "@/components/layout/Surface";
import { photography, textureAssets, illustrationAssets } from "@/lib/visualAssets";

export function HomeHero() {
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const floatX = useTransform(parallaxX, (value) => `${value * 0.6}px`);
  const floatY = useTransform(parallaxY, (value) => `${value * 0.6}px`);

  const handlePointer = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const offsetY = event.clientY - bounds.top;
      const normalizedX = (offsetX / bounds.width - 0.5) * 18;
      const normalizedY = (offsetY / bounds.height - 0.5) * 12;
      parallaxX.set(normalizedX);
      parallaxY.set(normalizedY);
    },
    [parallaxX, parallaxY, shouldReduceMotion],
  );

  const resetParallax = useCallback(() => {
    if (shouldReduceMotion) return;
    parallaxX.set(0);
    parallaxY.set(0);
  }, [parallaxX, parallaxY, shouldReduceMotion]);

  return (
    <PageSection
      tone="sand"
      texture="linen"
      collage={{
        parallax: true,
        layers: [
          { type: "texture", src: textureAssets.linen, blendMode: "multiply", opacity: 0.45 },
          { type: "illustration", src: illustrationAssets.fernSilhouette, blendMode: "screen", opacity: 0.35 },
          { type: "illustration", src: illustrationAssets.strandOrbit, blendMode: "soft-light", opacity: 0.4 },
        ],
      }}
      className="relative"
      innerClassName="relative z-10"
    >
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
        {/* ── Left column: copy ── */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center text-xs uppercase tracking-[0.5em] text-brand-graphite/55">
              Lorraine Hawkins — Trichologist
            </span>
            <h1 className="font-display text-4xl leading-tight text-brand-graphite sm:text-[2.95rem]">
              Clinical trichology education
              <br />
              for hair professionals.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-brand-graphite/75">
              Lorraine Hawkins has spent 18 years in clinical practice. Now she teaches what she knows — through video courses, structured training programs, and hands-on workshops built for professionals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/education" size="lg" variant="primary">
              Explore Training
            </ButtonLink>
            <ButtonLink href="/education/videos" variant="ghost" size="lg" icon={<span aria-hidden>→</span>}>
              Video Courses
            </ButtonLink>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 text-sm text-brand-graphite/65">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-salmon" /> 18 years clinical practice
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-clay" /> Evidence-based
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-graphite" /> 2,400+ learners
            </span>
          </div>
        </div>

        {/* ── Right column: hero image with floating cards ── */}
        <div
          className="relative flex h-full items-center"
          onMouseMove={handlePointer}
          onMouseLeave={resetParallax}
          onBlur={resetParallax}
        >
          <motion.div
            style={shouldReduceMotion ? undefined : { x: floatX, y: floatY }}
            className="relative mx-auto w-full max-w-[420px]"
            transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 120, damping: 16 }}
          >
            <Surface variant="glass" padding="none" className="overflow-hidden">
              <Image
                src={photography.hero.src}
                alt={photography.hero.alt}
                width={640}
                height={840}
                priority
                className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
              />
            </Surface>

            {/* Floating card: Video Courses */}
            <motion.div
              className="absolute -left-14 top-14 hidden w-44 rotate-[-6deg] md:block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.95, 0.45, 1] }}
            >
              <Surface variant="card" padding="sm" texture="linen" className="text-sm text-brand-graphite/75">
                <p className="font-semibold text-brand-graphite">Video Courses</p>
                <p>Condition-specific clinical training modules.</p>
              </Surface>
            </motion.div>

            {/* Floating card: Intensive Programs */}
            <motion.div
              className="absolute -right-12 bottom-12 hidden w-48 rotate-3 md:block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.25, 0.95, 0.45, 1] }}
            >
              <Surface variant="card" padding="sm" className="space-y-1 text-sm text-brand-graphite/75">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/60">Intensive Programs</p>
                <p className="font-semibold text-brand-graphite">Courses & Workshops</p>
                <p>Structured training for salons and practitioners.</p>
              </Surface>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </PageSection>
  );
}
