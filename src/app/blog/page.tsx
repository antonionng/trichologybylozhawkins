import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { BlogHighlightsSection } from "@/components/sections/BlogHighlightsSection";
import { Surface } from "@/components/layout/Surface";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ButtonLink } from "@/components/ui/Button";
import { blogHighlights } from "@/lib/content";

const insightThemes = [
  {
    title: "Clinical guides",
    description:
      "Learn assessment techniques, understand different scalp conditions, and develop effective treatment plans.",
    bullets: ["Scalp assessment methods", "Common condition guides", "When to refer to specialists"],
  },
  {
    title: "Business growth",
    description:
      "Practical guidance on pricing services, talking to clients about products, and tracking your results.",
    bullets: ["Consultation frameworks", "Product recommendation tips", "Simple progress tracking"],
  },
  {
    title: "Case studies",
    description:
      "Real examples showing treatment journeys from assessment to results, with lessons learned along the way.",
    bullets: ["Treatment timelines", "What worked and why", "Client home care routines"],
  },
];

const researchSignals = [
  {
    label: "Real experience",
    detail: "Every article draws from Lorraine's years of clinical practice and teaching experience.",
  },
  {
    label: "Personally reviewed",
    detail: "Lorraine reviews and edits each article to ensure accuracy and practical value.",
  },
  {
    label: "Evidence-based",
    detail: "Information is checked against current research and proven methods that actually work.",
  },
];

export default function Blog() {
  const [featuredArticle, ...otherArticles] = blogHighlights;
  const supportingArticles = otherArticles.slice(0, 2);

  const formatPublishedDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = Number(month) - 1;
    const monthLabel = monthNames[monthIndex] ?? month;
    return `${day.padStart(2, "0")} ${monthLabel} ${year}`;
  };

  return (
    <main>
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Knowledge Hub"
            title="Practical insights from real experience"
            description="Learn from Lorraine's years of practice. Clear, practical articles that help you understand scalp health and improve your skills."
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <Surface variant="card" padding="lg" className="space-y-4 text-base leading-relaxed text-brand-graphite/78">
              <p>
                Find evidence-based information on scalp health, treatment techniques, and growing your practice. Each article is written from real experience to help you understand not just what to do, but why it works.
              </p>
              <p>
                Get practical frameworks, step-by-step guides, and tools you can start using immediately. Clear information without unnecessary jargon.
              </p>
            </Surface>
            {featuredArticle ? (
              <Surface
                variant="glass"
                padding="lg"
                className="space-y-6 rounded-glass-lg border border-white/50 bg-white/80 backdrop-blur-sm text-brand-graphite"
              >
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-brand-salmon/60 px-4 py-1 text-xs uppercase tracking-[0.32em] text-brand-ivory">
                    Featured insight
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl leading-tight">{featuredArticle.title}</h3>
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-graphite/55">
                      {featuredArticle.category} · {formatPublishedDate(featuredArticle.published)}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-brand-graphite/75">{featuredArticle.excerpt}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <ButtonLink href={`/blog/${featuredArticle.slug}`} variant="secondary" size="md">
                    Read article
                  </ButtonLink>
                  <ButtonLink href="/contact?topic=knowledge-hub" variant="ghost" size="md">
                    Ask a question
                  </ButtonLink>
                </div>
                {supportingArticles.length > 0 ? (
                  <div className="space-y-3 border-t border-white/50 pt-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-graphite/55">More articles</p>
                    <div className="space-y-2">
                      {supportingArticles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium text-brand-graphite">{article.title}</p>
                            <span className="text-xs uppercase tracking-[0.28em] text-brand-graphite/50">
                              {article.category} · {formatPublishedDate(article.published)}
                            </span>
                          </div>
                          <ButtonLink href={`/blog/${article.slug}`} variant="ghost" size="sm">
                            Open
                          </ButtonLink>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Surface>
            ) : null}
          </div>
        </Container>
      </PageSection>

      <BlogHighlightsSection />

      <PageSection tone="mist" className="relative">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Topics covered"
            title="What you'll learn"
            description="Every article includes practical takeaways you can use immediately—checklists, templates, and clear guidance."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {insightThemes.map((theme) => (
              <Surface key={theme.title} variant="card" padding="lg" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display text-xl text-brand-graphite">{theme.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-graphite/75">{theme.description}</p>
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-brand-graphite/70">
                  {theme.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-brand-salmon/50" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Quality standards"
            title="Information you can trust"
            description="Every article is reviewed for accuracy and practical value before publication."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {researchSignals.map((signal) => (
              <Surface key={signal.label} variant="subtle" padding="lg" className="space-y-2 text-sm leading-relaxed">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-graphite/55">{signal.label}</p>
                <p className="text-base text-brand-graphite/80">{signal.detail}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <ConsultationCta />
    </main>
  );
}

