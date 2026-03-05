export type HomeVideoRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  durationMinutes: number | null;
  publicContent: unknown;
  price: number | null;
  heroUrl?: string | null;
};

export type HomeCourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  level: string;
  durationMinutes: number | null;
  moduleCount: number;
  price: number | null;
  heroUrl?: string | null;
};

export type HomeProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  imageUrl?: string | null;
};

type ShowcaseDeps = {
  loadVideos: () => Promise<any[]>;
  loadCourses: () => Promise<any[]>;
  loadProducts: () => Promise<any[]>;
  signUrl: (path: string) => Promise<string>;
  videoFallbackBySlug: Record<string, string>;
  videoFallbackDefault: string;
};

export async function loadHomeShowcaseData(deps: ShowcaseDeps) {
  const [videosResult, coursesResult, productsResult] = await Promise.allSettled([
    deps.loadVideos(),
    deps.loadCourses(),
    deps.loadProducts(),
  ]);

  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
  const courses = coursesResult.status === "fulfilled" ? coursesResult.value : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value : [];

  const videoRows: HomeVideoRow[] = [];
  for (const v of videos) {
    let heroUrl: string | null = null;
    if (v.heroMedia?.path) {
      try {
        heroUrl = await deps.signUrl(v.heroMedia.path);
      } catch {
        // ignore
      }
    }
    if (!heroUrl) {
      heroUrl = (v.meta as any)?.heroImage ?? deps.videoFallbackBySlug[v.slug] ?? deps.videoFallbackDefault;
    }
    videoRows.push({
      id: v.id,
      slug: v.slug,
      title: v.title,
      subtitle: v.subtitle,
      category: v.category,
      durationMinutes: v.durationMinutes,
      publicContent: v.publicContent,
      price: v.pricing?.[0] ? Number(v.pricing[0].amount) : null,
      heroUrl,
    });
  }

  const courseRows: HomeCourseRow[] = [];
  for (const c of courses) {
    let heroUrl: string | null = null;
    if (c.heroMedia?.path) {
      try {
        heroUrl = await deps.signUrl(c.heroMedia.path);
      } catch {
        // ignore
      }
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
      moduleCount: c._count?.modules ?? 0,
      price: c.pricing?.[0] ? Number(c.pricing[0].amount) : null,
      heroUrl,
    });
  }

  const productRows: HomeProductRow[] = [];
  for (const p of products) {
    let imageUrl: string | null = null;
    if (p.heroMedia?.path) {
      try {
        imageUrl = await deps.signUrl(p.heroMedia.path);
      } catch {
        // ignore
      }
    }
    if (!imageUrl && p.images?.[0]?.media?.path) {
      try {
        imageUrl = await deps.signUrl(p.images[0].media.path);
      } catch {
        // ignore
      }
    }
    if (!imageUrl) {
      imageUrl = (p.meta as any)?.image ?? null;
    }
    productRows.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      price: Number(p.price),
      imageUrl,
    });
  }

  return { videos: videoRows, courses: courseRows, products: productRows };
}

