'use client';

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { blogHighlights, BlogHighlight } from "@/lib/content";
import { getTopicAccent } from "@/lib/topicAccents";

type Props = {
  /** DB-sourced posts (if any). Falls back to hardcoded blogHighlights. */
  posts?: BlogHighlight[];
};

export function BlogHighlightsSection({ posts }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const items = posts && posts.length > 0 ? posts : blogHighlights;

  const formatPublishedDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = Number(month) - 1;
    const monthLabel = monthNames[monthIndex] ?? month;
    return `${day?.padStart(2, "0") ?? "01"} ${monthLabel} ${year}`;
  };

  return (
    <PageSection tone="transparent" padding="compact" className="relative">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Knowledge Hub"
          title="Articles and insights"
          description="Practical guides on hair loss, scalp health, and trichology — written from real clinical experience."
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {items.slice(0, 3).map((post, index) => {
            const accent = getTopicAccent(post.category);
            return (
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
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-md hover:border-brand-graphite/15">
                    {/* Hero image or colored accent bar */}
                    {post.heroImage ? (
                      <div className="h-36 sm:h-40">
                        <img
                          src={post.heroImage}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`h-1 bg-gradient-to-r ${accent.gradient}`} />
                    )}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex rounded-full ${accent.bg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${accent.text}`}>
                          {post.category}
                        </span>
                        <span className="rounded-full bg-brand-graphite/5 px-2 py-0.5 text-[10px] text-brand-graphite/40">
                          {formatPublishedDate(post.published)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg leading-snug text-brand-graphite group-hover:text-brand-salmon transition-colors">
                        {post.title}
                      </h3>
                      <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-salmon">
                        Read article <span aria-hidden>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </PageSection>
  );
}
