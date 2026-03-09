import { prisma } from "@/server/db/client";
import { HomeHero } from "@/components/sections/HomeHero";
import { EducationShowcase, VideoRow, CourseRow } from "@/components/sections/EducationShowcase";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { ProductsShowcase } from "@/components/sections/ProductsShowcase";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BlogHighlightsSection } from "@/components/sections/BlogHighlightsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import {
  HOME_PRODUCT_FALLBACKS,
  VIDEO_HERO_PLACEHOLDER_BY_SLUG,
  VIDEO_HERO_PLACEHOLDER_DEFAULT,
} from "@/lib/content";
import { loadHomeShowcaseData } from "@/server/modules/home/showcase";

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

export default async function Home() {
  const { videos, courses, products } = await getShowcaseData();

  return (
    <main>
      <HomeHero />
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
