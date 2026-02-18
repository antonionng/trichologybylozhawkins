'use client';

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { faqItems } from "@/lib/content";
import { Surface } from "@/components/layout/Surface";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageSection tone="mist" texture="linen">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions"
            description="Honest answers to help you decide if Lorraine's courses and services are right for you."
          />
          <Surface variant="card" padding="lg" className="space-y-3 text-sm text-brand-graphite/75">
            <p className="font-semibold text-brand-graphite">Still have questions?</p>
            <p>
              Get in touch and Lorraine or her team will help you find the right course, service, or next step.
            </p>
          </Surface>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Surface
                key={faq.question}
                variant="subtle"
                padding="md"
                className="border border-brand-graphite/15 bg-white/85 backdrop-blur shadow-soft-top"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left gap-4"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-display text-lg text-brand-graphite">{faq.question}</span>
                  <span className="text-2xl text-brand-graphite/50 shrink-0" aria-hidden>
                    {isOpen ? "\u2212" : "+"}
                  </span>
                  <span className="sr-only">{isOpen ? "Collapse answer" : "Expand answer"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.p
                      initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={shouldReduceMotion ? undefined : { duration: 0.35, ease: [0.25, 0.95, 0.45, 1] }}
                      className="mt-4 text-sm leading-relaxed text-brand-graphite/70"
                    >
                      {faq.answer}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </Surface>
            );
          })}
        </div>
      </Container>
    </PageSection>
  );
}
