'use client';

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { blogHighlights } from "@/lib/content";
import { Surface } from "@/components/layout/Surface";

export function BlogHighlightsSection() {
  const shouldReduceMotion = useReducedMotion();

  const formatPublishedDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = Number(month) - 1;
    const monthLabel = monthNames[monthIndex] ?? month;
    return `${day.padStart(2, "0")} ${monthLabel} ${year}`;
  };

  return (
    <PageSection tone="transparent" className="relative">
      <Container className="space-y-12">
        <SectionHeading
          eyebrow="Knowledge Hub"
          title="Expert insights and practical guides"
          description="Learn from Lorraine's experience through articles covering scalp health, treatment techniques, and business growth."
          align="center"
        />
        <div className="grid gap-8 lg:grid-cols-3">
          {blogHighlights.map((post, index) => (
            <motion.article
              key={post.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.55, delay: index * 0.06, ease: [0.25, 0.95, 0.45, 1] }
              }
              viewport={{ once: true, margin: "-10%" }}
            >
              <Surface variant="card" padding="lg" className="flex h-full flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full bg-brand-salmon/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-brand-ivory">
                    {post.category}
                  </span>
                  <h3 className="font-display text-xl text-brand-graphite">{post.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-graphite/70">{post.excerpt}</p>
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-graphite/55">
                  <span>{formatPublishedDate(post.published)}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-brand-graphite hover:text-brand-salmon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-salmon"
                  >
                    Read →
                  </Link>
                </div>
              </Surface>
            </motion.article>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}

