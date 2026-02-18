'use client';

import { motion, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

type CategoryCtaConfig = {
  headline: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

const categoryConfig: Record<string, CategoryCtaConfig> = {
  "Hair Loss": {
    headline: "Concerned about hair loss?",
    description:
      "Book a personal consultation with Lorraine for a thorough scalp assessment, honest answers, and a clear plan tailored to your hair.",
    primaryCta: { label: "Book a consultation", href: "/contact" },
    secondaryCta: { label: "Browse hair loss courses", href: "/education/videos" },
  },
  "Scalp Health": {
    headline: "Ready to improve your scalp health?",
    description:
      "Whether you need professional guidance or want to learn evidence-based scalp care techniques, Lorraine can help you find the right path.",
    primaryCta: { label: "Book a scalp assessment", href: "/contact" },
    secondaryCta: { label: "Explore scalp care courses", href: "/education/videos" },
  },
  "Consultations": {
    headline: "Want to offer better consultations?",
    description:
      "Learn Lorraine's consultation framework through hands-on training. Build client trust and grow your professional reputation.",
    primaryCta: { label: "Explore training options", href: "/services" },
    secondaryCta: { label: "View course catalogue", href: "/education" },
  },
  "Clinical Guide": {
    headline: "Take your clinical skills further",
    description:
      "Lorraine's professional training programmes give you the confidence and frameworks to handle complex cases and grow your practice.",
    primaryCta: { label: "Explore professional training", href: "/services" },
    secondaryCta: { label: "View all courses", href: "/education" },
  },
  "Case Study": {
    headline: "See what's possible with the right approach",
    description:
      "Every client's journey is different. Book a consultation to discuss your specific concerns, or explore our training to help your own clients.",
    primaryCta: { label: "Book a consultation", href: "/contact" },
    secondaryCta: { label: "View training options", href: "/services" },
  },
  "Professional Development": {
    headline: "Invest in your professional growth",
    description:
      "From online courses to intensive in-person training, Lorraine offers programmes designed for working professionals who want clinical confidence.",
    primaryCta: { label: "View training programmes", href: "/services" },
    secondaryCta: { label: "Browse online courses", href: "/education" },
  },
  "Product Science": {
    headline: "Want to understand what really works?",
    description:
      "Cut through marketing claims with evidence-based education. Learn what ingredients and treatments are genuinely effective.",
    primaryCta: { label: "Explore courses", href: "/education" },
    secondaryCta: { label: "Book a consultation", href: "/contact" },
  },
  "Wellness": {
    headline: "Your hair health journey starts here",
    description:
      "Whether you're dealing with hair loss, scalp concerns, or just want to understand your hair better — Lorraine can help.",
    primaryCta: { label: "Book a consultation", href: "/contact" },
    secondaryCta: { label: "Learn more about hair health", href: "/education/videos" },
  },
};

const defaultConfig: CategoryCtaConfig = {
  headline: "Take the next step for your hair",
  description:
    "Whether you need personal guidance or want to deepen your professional skills, Lorraine offers consultations and training grounded in real clinical experience.",
  primaryCta: { label: "Book a consultation", href: "/contact" },
  secondaryCta: { label: "Explore courses & training", href: "/education" },
};

interface ArticleCtaProps {
  category?: string;
}

export function ArticleCta({ category }: ArticleCtaProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = (category && categoryConfig[category]) || defaultConfig;

  return (
    <PageSection tone="transparent" padding="compact">
      <Container className="max-w-4xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.6, ease: [0.25, 0.95, 0.45, 1] }
          }
          viewport={{ once: true, margin: "-10%" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-graphite to-brand-graphite/90 p-8 sm:p-10 lg:p-12"
        >
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-salmon/10" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-brand-sage/10" />

          <div className="relative space-y-6">
            <div className="max-w-xl space-y-3">
              <h3 className="font-display text-2xl leading-snug text-white sm:text-3xl">
                {config.headline}
              </h3>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                {config.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href={config.primaryCta.href}
                variant="primary"
                size="lg"
              >
                {config.primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href={config.secondaryCta.href}
                variant="ghost"
                size="lg"
                className="!text-white/80 hover:!text-white border border-white/20 hover:border-white/40"
              >
                {config.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>
        </motion.div>
      </Container>
    </PageSection>
  );
}
