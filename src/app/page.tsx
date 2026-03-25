import { prisma } from "@/server/db/client";
import { HomeHero } from "@/components/sections/HomeHero";
import { EducationShowcase, VideoRow, CourseRow } from "@/components/sections/EducationShowcase";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { ProductsShowcase } from "@/components/sections/ProductsShowcase";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BlogHighlightsSection } from "@/components/sections/BlogHighlightsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { HomepageFreeVideoBanner } from "@/components/sections/HomepageFreeVideoBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import {
  HOME_PRODUCT_FALLBACKS,
  VIDEO_HERO_PLACEHOLDER_BY_SLUG,
  VIDEO_HERO_PLACEHOLDER_DEFAULT,
  faqItems,
} from "@/lib/content";
import { FEATURED_PUBLIC_QUIZ_SLUG } from "@/lib/publicQuiz";
import { loadHomeShowcaseData } from "@/server/modules/home/showcase";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";
import { findHomepageFeaturedPublicQuizRecord } from "@/server/modules/education/publicQuizLookup";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/",
  title: "Lorraine Hawkins",
  description:
    "Clinical trichology education, scalp health guidance, consultations, and professional training for UK hair professionals and clients.",
  keywords: [
    "lorraine hawkins",
    "trichologist uk",
    "scalp health consultation",
    "trichology education",
    "hair loss support",
  ],
});

async function getShowcaseData() {
  return loadHomeShowcaseData({
    loadVideos: () =>
      prisma.videoProduct.findMany({
        where: { status: "PUBLISHED" },
        include: {
          pricing: { where: { isPrimary: true }, take: 1 },
          heroMedia: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    loadCourses: () =>
      prisma.course.findMany({
        where: { status: "PUBLISHED", slug: { not: "academy-quizzes" } },
        include: {
          pricing: { where: { isPrimary: true }, take: 1 },
          heroMedia: true,
          _count: { select: { modules: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    loadProducts: () =>
      prisma.shopProduct.findMany({
        where: { status: "PUBLISHED" },
        include: {
          heroMedia: true,
          images: { include: { media: true }, orderBy: { position: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    signUrl: createSignedDownloadUrl,
    videoFallbackBySlug: VIDEO_HERO_PLACEHOLDER_BY_SLUG,
    videoFallbackDefault: VIDEO_HERO_PLACEHOLDER_DEFAULT,
    productFallbacks: HOME_PRODUCT_FALLBACKS,
    onLoadError: (source, error) => {
      console.error(`[home-showcase] Failed to load ${source}`, error);
    },
  }) as Promise<{ videos: VideoRow[]; courses: CourseRow[]; products: any[] }>;
}

async function buildHomepageQuizBannerLead(slug: string) {
  const quiz = await findHomepageFeaturedPublicQuizRecord(slug);
  if (!quiz?.slug) return null;

  let heroUrl: string | null = null;
  if (quiz.heroMediaId) {
    const heroMedia = await prisma.mediaAsset.findUnique({
      where: { id: quiz.heroMediaId },
      select: { path: true },
    });
    if (heroMedia?.path) {
      try {
        heroUrl = await createSignedDownloadUrl(heroMedia.path);
      } catch {
        heroUrl = null;
      }
    }
  }

  const category = slug === FEATURED_PUBLIC_QUIZ_SLUG ? "Scalp guidance" : null;

  return {
    kind: "QUIZ" as const,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    category,
    heroUrl: heroUrl ?? quiz.cardImageUrl ?? null,
  };
}

async function getHomepageFeaturedQuiz() {
  try {
    const lead = await getCurrentFeaturedLeadItem();
    if (lead?.kind === "QUIZ" && lead.slug) {
      const fromAdmin = await buildHomepageQuizBannerLead(lead.slug);
      if (fromAdmin) return fromAdmin;
    }

    let quiz = await findHomepageFeaturedPublicQuizRecord(FEATURED_PUBLIC_QUIZ_SLUG);

    if (!quiz) {
      await ensureFeaturedPublicQuizExists(FEATURED_PUBLIC_QUIZ_SLUG);
      quiz = await findHomepageFeaturedPublicQuizRecord(FEATURED_PUBLIC_QUIZ_SLUG);
    }

    if (!quiz?.slug) return null;

    return buildHomepageQuizBannerLead(quiz.slug);
  } catch {
    return null;
  }
}

export default async function Home() {
  const [{ videos, courses, products }, featuredQuiz] = await Promise.all([
    getShowcaseData(),
    getHomepageFeaturedQuiz(),
  ]);

  return (
    <main>
      <JsonLd data={buildFaqJsonLd("/", faqItems)} />
      <HomeHero />
      {featuredQuiz ? <HomepageFreeVideoBanner lead={featuredQuiz} /> : null}
      <EducationShowcase videos={videos} courses={courses} />
      <ProductsShowcase products={products as any} />
      <ServicesShowcase />
      <ConsultationCta />
      <TestimonialsSection />
      <BlogHighlightsSection />
      <FaqSection />
    </main>
  );
}
