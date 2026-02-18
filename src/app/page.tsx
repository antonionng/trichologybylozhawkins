import { prisma } from "@/server/db/client";
import { HomeHero } from "@/components/sections/HomeHero";
import { EducationShowcase, VideoRow, CourseRow } from "@/components/sections/EducationShowcase";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BlogHighlightsSection } from "@/components/sections/BlogHighlightsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { VIDEO_HERO_PLACEHOLDER_BY_SLUG, VIDEO_HERO_PLACEHOLDER_DEFAULT } from "@/lib/content";

async function getShowcaseData() {
  try {
    const [videos, courses] = await Promise.all([
      prisma.videoProduct.findMany({
        where: { status: "PUBLISHED" },
        include: {
          pricing: { where: { isPrimary: true }, take: 1 },
          heroMedia: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
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
    ]);

    const videoRows: VideoRow[] = [];
    for (const v of videos) {
      let heroUrl: string | null = null;
      if (v.heroMedia?.path) {
        try { heroUrl = await createSignedDownloadUrl(v.heroMedia.path); }
        catch { /* fall through */ }
      }
      if (!heroUrl) {
        heroUrl = (v.meta as any)?.heroImage ?? VIDEO_HERO_PLACEHOLDER_BY_SLUG[v.slug] ?? VIDEO_HERO_PLACEHOLDER_DEFAULT;
      }
      videoRows.push({
        id: v.id,
        slug: v.slug,
        title: v.title,
        subtitle: v.subtitle,
        category: v.category,
        durationMinutes: v.durationMinutes,
        publicContent: v.publicContent,
        price: v.pricing[0] ? Number(v.pricing[0].amount) : null,
        heroUrl,
      });
    }

    const courseRows: CourseRow[] = [];
    for (const c of courses) {
      let heroUrl: string | null = null;
      if (c.heroMedia?.path) {
        try { heroUrl = await createSignedDownloadUrl(c.heroMedia.path); }
        catch { /* fall through */ }
      }
      if (!heroUrl) {
        heroUrl = (c.meta as any)?.heroImage ?? null;
      }
      courseRows.push({
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        level: c.level,
        durationMinutes: c.durationMinutes,
        moduleCount: c._count.modules,
        price: c.pricing[0] ? Number(c.pricing[0].amount) : null,
        heroUrl,
      });
    }

    return { videos: videoRows, courses: courseRows };
  } catch {
    return { videos: [], courses: [] };
  }
}

export default async function Home() {
  const { videos, courses } = await getShowcaseData();

  return (
    <main>
      <HomeHero />
      <EducationShowcase videos={videos} courses={courses} />
      <ServicesShowcase />
      <ConsultationCta />
      <TestimonialsSection />
      <BlogHighlightsSection />
      <FaqSection />
    </main>
  );
}
