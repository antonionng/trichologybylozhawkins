export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/server/db/client";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { Surface } from "@/components/layout/Surface";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ArticleCta } from "@/components/sections/ArticleCta";
import { ButtonLink } from "@/components/ui/Button";
import { blogHighlights } from "@/lib/content";

/* ─── Hardcoded fallback posts ─── */

const blogPosts: Record<
  string,
  {
    title: string;
    category: string;
    published: string;
    readTime: string;
    excerpt: string;
    heroImage?: string;
    content: { type: string; text?: string; items?: string[] }[];
  }
> = {
  "decoding-hormonal-hair-loss": {
    title: "Understanding Hormonal Hair Loss: A Practical Guide",
    category: "Hair Loss",
    published: "2025-10-02",
    readTime: "8 min read",
    excerpt:
      "Learn to recognize hormonal hair loss patterns and have supportive conversations with clients about treatment options.",
    heroImage:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    content: [
      { type: "paragraph", text: "Hormonal hair loss is one of the most common concerns clients bring to trichologists and hair care professionals. Understanding the patterns, triggers, and appropriate responses can transform your consultations from uncertain to confident." },
      { type: "heading", text: "Recognizing the patterns" },
      { type: "paragraph", text: "Hormonal hair loss typically presents with specific patterns that differ from other forms of hair loss. The most common presentation is diffuse thinning across the crown and top of the scalp, while the hairline often remains relatively intact." },
      { type: "list", items: ["Gradual thinning over months or years rather than sudden shedding", "Increased hair fall during washing or brushing", "Visible scalp becoming more apparent, especially under bright light", "Changes in hair texture—often becoming finer or less dense"] },
      { type: "heading", text: "Common hormonal triggers" },
      { type: "paragraph", text: "Several hormonal transitions can trigger hair loss. Understanding these helps you ask the right questions during consultations:" },
      { type: "subheading", text: "Post-pregnancy changes" },
      { type: "paragraph", text: "Postpartum hair shedding typically occurs 3-6 months after giving birth. While distressing, this is temporary and usually resolves within 6-12 months." },
      { type: "subheading", text: "Perimenopause and menopause" },
      { type: "paragraph", text: "As estrogen levels decline, the ratio of androgens increases, which can trigger hair thinning. This typically begins in the 40s but varies widely." },
      { type: "subheading", text: "Thyroid imbalances" },
      { type: "paragraph", text: "Both hypothyroidism and hyperthyroidism can cause diffuse hair loss. Always ask about energy levels, weight changes, and temperature sensitivity." },
      { type: "heading", text: "Having supportive conversations" },
      { type: "list", items: ["Acknowledge their concern without minimizing it", "Ask about recent life changes", "Explain that you can support scalp health while they explore hormonal factors", "Recommend they speak with their GP about hormone testing if appropriate"] },
      { type: "callout", text: "The most important thing you can offer is reassurance backed by knowledge. Help clients understand that hormonal hair loss is common, often temporary, and manageable with the right support." },
    ],
  },
  "future-of-scalp-detox": {
    title: "Scalp Detox Treatments That Actually Work",
    category: "Scalp Health",
    published: "2025-09-24",
    readTime: "6 min read",
    excerpt:
      "Science-based detox techniques that cleanse without damaging the scalp's natural protective barrier.",
    heroImage:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
    content: [
      { type: "paragraph", text: "Scalp detox has become a buzzword in hair care, but not all approaches are created equal. Here's what actually works." },
      { type: "heading", text: "Understanding the scalp microbiome" },
      { type: "paragraph", text: "Your scalp is home to a diverse community of microorganisms that work together to protect skin health. A good detox treatment supports this ecosystem rather than destroying it." },
      { type: "list", items: ["Prevents water loss and keeps skin hydrated", "Contains antimicrobial compounds", "Delivers vitamin E and other antioxidants to hair follicles", "Creates an acidic environment that beneficial microbes thrive in"] },
      { type: "heading", text: "Effective detox techniques" },
      { type: "subheading", text: "1. Pre-cleanse oil treatment" },
      { type: "paragraph", text: "Apply a lightweight oil to the scalp 15-20 minutes before shampooing. Massage gently. This dissolves oil-soluble buildup without stripping." },
      { type: "subheading", text: "2. Clay-based masks (used correctly)" },
      { type: "paragraph", text: "Bentonite or kaolin clay can absorb excess sebum and impurities. Apply only to the scalp, leave for 5-10 minutes maximum." },
      { type: "subheading", text: "3. Enzyme exfoliation" },
      { type: "paragraph", text: "Fruit enzymes gently break down dead skin cells without mechanical scrubbing. Look for products with papain or bromelain." },
      { type: "heading", text: "What to avoid" },
      { type: "list", items: ["Harsh sulfate shampoos", "Overly acidic apple cider vinegar rinses", "Baking soda scrubs", "Aggressive physical scrubs", "Frequent detoxing—once a month is plenty"] },
      { type: "callout", text: "The best scalp detox is one your client doesn't even notice. They should feel refreshed, not stripped or irritated." },
    ],
  },
  "ethical-consultations": {
    title: "Building Trust Through Better Consultations",
    category: "Consultations",
    published: "2025-09-10",
    readTime: "7 min read",
    excerpt:
      "Practical tips and conversation frameworks for conducting scalp consultations that clients value and remember.",
    heroImage:
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80",
    content: [
      { type: "paragraph", text: "A consultation isn't just a prelude to treatment—it's where trust is built or broken." },
      { type: "heading", text: "Why consultations matter" },
      { type: "paragraph", text: "Clients who value consultations are the ones who stay with you long-term." },
      { type: "list", items: ["Makes the client feel heard and understood", "Educates without overwhelming", "Creates clear next steps that feel collaborative, not prescribed"] },
      { type: "heading", text: "The consultation framework" },
      { type: "subheading", text: "1. Start with their story" },
      { type: "paragraph", text: "Begin with open-ended questions and actually listen to the answers." },
      { type: "subheading", text: "2. Assessment and education" },
      { type: "paragraph", text: "This is where your expertise shines. Explain what you're seeing as you go." },
      { type: "subheading", text: "3. Collaborative planning" },
      { type: "paragraph", text: "This isn't where you sell—it's where you co-create a plan." },
      { type: "heading", text: "Documentation and follow-up" },
      { type: "list", items: ["Take detailed notes", "Send a follow-up email", "Schedule the next appointment before they leave", "Follow up in 2-3 days"] },
      { type: "callout", text: "A rushed free consultation attracts price shoppers. A thorough paid consultation attracts clients who value expertise." },
      { type: "paragraph", text: "Your consultations are your reputation. Make them count." },
    ],
  },
};

/* ─── Fetch from CMS ─── */

type ContentSection = {
  type: string;
  text?: string;
  items?: string[];
};

type ContentSlotArticleRecord = {
  id: string;
  title: string;
  brief: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  metadata: unknown;
  assets: Array<{
    type: string;
    mediaUrl?: string | null;
    variants?: Array<{
      copy?: string | null;
    }>;
  }>;
};

async function getArticleFromCms(slug: string) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: "blog-posts" },
    });
    if (!collection) return null;

    const entry = await prisma.entry.findFirst({
      where: {
        collectionId: collection.id,
        slug,
        status: "PUBLISHED",
      },
      include: {
        mediaLinks: { include: { media: true } },
      },
    });
    if (!entry) return null;

    const meta = (entry.meta ?? {}) as Record<string, any>;
    const content = (entry.content ?? { sections: [] }) as {
      sections: ContentSection[];
    };

    return {
      title: entry.title,
      category: meta.category || "Article",
      published: entry.publishedAt
        ? entry.publishedAt.toISOString().slice(0, 10)
        : entry.createdAt.toISOString().slice(0, 10),
      readTime: meta.readTime || "5 min read",
      excerpt: entry.summary || "",
      heroImage: meta.heroImage || "",
      content: content.sections || [],
    };
  } catch {
    return null;
  }
}

const splitCopyIntoSections = (copy: string) =>
  copy
    .split(/\n{2,}/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", text }));

export function mapContentSlotToArticle(slot: ContentSlotArticleRecord) {
  const meta = (slot.metadata ?? {}) as Record<string, any>;
  const copyAsset = slot.assets.find((asset) => asset.type === "COPY");
  const primaryVariant = copyAsset?.variants?.[0];
  const sections = primaryVariant?.copy
    ? splitCopyIntoSections(primaryVariant.copy)
    : slot.brief
      ? [{ type: "paragraph", text: slot.brief }]
      : [];
  const imageAsset = slot.assets.find((asset) => asset.type === "IMAGE" && asset.mediaUrl);

  return {
    title: slot.title,
    category: meta.category || "Article",
    published: (slot.publishedAt ?? slot.createdAt).toISOString().slice(0, 10),
    readTime: meta.readTime || "5 min read",
    excerpt: slot.brief || meta.excerpt || "",
    heroImage: meta.heroImage || imageAsset?.mediaUrl || "",
    content: sections,
  };
}

async function getArticleFromContentSlot(slug: string) {
  try {
    const slots = await prisma.contentSlot.findMany({
      where: { channel: "BLOG", status: "PUBLISHED" },
      include: {
        assets: {
          orderBy: { createdAt: "asc" },
          include: {
            variants: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    const slot = slots.find((item) => {
      const meta = (item.metadata ?? {}) as Record<string, any>;
      return (meta.slug || item.id) === slug;
    });

    return slot ? mapContentSlotToArticle(slot as ContentSlotArticleRecord) : null;
  } catch {
    return null;
  }
}

/* ─── Helpers ─── */

function formatPublishedDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIndex = Number(month) - 1;
  const monthLabel = monthNames[monthIndex] ?? month;
  return `${(day ?? "01").padStart(2, "0")} ${monthLabel} ${year}`;
}

/* ─── Page ─── */

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;

  const cmsPost = await getArticleFromCms(slug);
  const slotPost = cmsPost ? null : await getArticleFromContentSlot(slug);
  const post = cmsPost || slotPost || blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <main>
      {/* Hero */}
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <ButtonLink href="/blog" variant="ghost" size="sm">
                &larr; Back to articles
              </ButtonLink>
              <span className="inline-flex rounded-full bg-brand-salmon/60 px-4 py-1.5 text-xs uppercase tracking-[0.32em] text-brand-ivory">
                {post.category}
              </span>
              <h1 className="font-display text-4xl leading-tight text-brand-graphite lg:text-5xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-brand-graphite/60">
                <span>{formatPublishedDate(post.published)}</span>
                <span>&bull;</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Hero image */}
      {post.heroImage && (
        <PageSection tone="transparent" className="!py-0">
          <Container className="max-w-4xl">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={post.heroImage}
                alt={post.title}
                className="h-64 w-full object-cover sm:h-80 lg:h-96"
              />
            </div>
          </Container>
        </PageSection>
      )}

      {/* Content */}
      <PageSection tone="transparent">
        <Container className="max-w-3xl">
          <Surface variant="card" padding="lg" className="prose prose-lg max-w-none">
            <div className="space-y-6">
              {post.content.map(
                (section: ContentSection, index: number) => {
                  if (section.type === "paragraph") {
                    return (
                      <p
                        key={index}
                        className="text-base leading-relaxed text-brand-graphite/80"
                      >
                        {section.text}
                      </p>
                    );
                  }
                  if (section.type === "heading") {
                    return (
                      <h2
                        key={index}
                        className="mt-12 font-display text-2xl text-brand-graphite first:mt-0"
                      >
                        {section.text}
                      </h2>
                    );
                  }
                  if (section.type === "subheading") {
                    return (
                      <h3
                        key={index}
                        className="mt-8 font-display text-xl text-brand-graphite"
                      >
                        {section.text}
                      </h3>
                    );
                  }
                  if (section.type === "list" && section.items) {
                    return (
                      <ul key={index} className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex gap-3 text-base leading-relaxed text-brand-graphite/80"
                          >
                            <span className="mt-2 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon/60" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (section.type === "callout") {
                    return (
                      <div
                        key={index}
                        className="my-8 rounded-lg border-l-4 border-brand-salmon/60 bg-brand-salmon/5 p-6"
                      >
                        <p className="text-base italic leading-relaxed text-brand-graphite/90">
                          {section.text}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }
              )}
            </div>
          </Surface>
        </Container>
      </PageSection>

      <ArticleCta category={post.category} />
      <ConsultationCta />
    </main>
  );
}
