'use client';

import { motion, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";
import { testimonials } from "@/lib/content";

export function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageSection tone="sand" texture="veined">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What learners and professionals say"
          description="Real feedback from women who have watched Lorraine's video courses and professionals who have trained with her."
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.6, delay: index * 0.08, ease: [0.25, 0.95, 0.45, 1] }
              }
              viewport={{ once: true, margin: "-10%" }}
            >
              <Surface variant="card" padding="lg" texture="linen" className="space-y-4 h-full">
                <p className="text-lg italic leading-relaxed text-brand-graphite/80">&ldquo;{item.quote}&rdquo;</p>
                <div className="space-y-1">
                  <p className="font-semibold text-brand-graphite">{item.author}</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-graphite/60">{item.role}</p>
                </div>
              </Surface>
            </motion.div>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
