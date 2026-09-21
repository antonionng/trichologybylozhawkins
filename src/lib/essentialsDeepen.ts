/**
 * Salon Trichology Essentials deepen catalog.
 * Look up by slug/title — IDs differ by environment.
 * Do not add new course or video SKUs.
 */
export const ESSENTIALS_COURSE_SLUG = "salon-trichology-essentials";

export const ESSENTIALS_PLACEHOLDER_MARK = "[DRAFT PLACEHOLDER]";

export type EssentialsLessonSpec = {
  slug: string;
  titleIncludes: string[];
  videoFile: string;
};

export type EssentialsModuleSpec = {
  slug: string;
  title: string;
  titleIncludes: string;
  lessons: EssentialsLessonSpec[];
  quiz: {
    title: string;
    slug: string;
  };
  onePager: {
    slug: string;
    title: string;
    markdownFile: string;
    pdfFile: string;
  };
};

export const ESSENTIALS_MODULES: EssentialsModuleSpec[] = [
  {
    slug: "recognising-common-scalp-concerns",
    title: "Recognising Common Scalp Concerns",
    titleIncludes: "Recognising Common Scalp Concerns",
    lessons: [
      {
        slug: "scalp-conditions",
        titleIncludes: ["scalp conditions", "you'll see most often"],
        videoFile: "vo.mp4",
      },
      {
        slug: "when-hair-loss-is-more-than-normal-shedding",
        titleIncludes: ["when hair loss", "more than normal shedding"],
        videoFile: "vo.mp4",
      },
    ],
    quiz: {
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-check: Recognising Common Scalp Concerns`,
      slug: "essentials-chair-check-scalp-concerns",
    },
    onePager: {
      slug: "scalp-concerns-referral-script",
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-side: Recognising Common Scalp Concerns`,
      markdownFile: "recognising-common-scalp-concerns.md",
      pdfFile: "recognising-common-scalp-concerns.pdf",
    },
  },
  {
    slug: "client-conversations-that-build-trust",
    title: "Client Conversations That Build Trust",
    titleIncludes: "Client Conversations That Build Trust",
    lessons: [
      {
        slug: "starting-the-conversation",
        titleIncludes: ["starting the conversation"],
        videoFile: "vo.mp4",
      },
      {
        slug: "recommending-products-services",
        titleIncludes: ["recommending products", "products and services"],
        videoFile: "vo.mp4",
      },
    ],
    quiz: {
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-check: Client Conversations That Build Trust`,
      slug: "essentials-chair-check-client-conversations",
    },
    onePager: {
      slug: "client-conversations-referral-script",
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-side: Client Conversations That Build Trust`,
      markdownFile: "client-conversations-that-build-trust.md",
      pdfFile: "client-conversations-that-build-trust.pdf",
    },
  },
  {
    slug: "know-your-boundaries",
    title: "Know Your Boundaries",
    titleIncludes: "Know Your Boundaries",
    lessons: [
      {
        slug: "scope-of-practice-for-stylists",
        titleIncludes: ["scope of practice"],
        videoFile: "vo.mp4",
      },
    ],
    quiz: {
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-check: Know Your Boundaries`,
      slug: "essentials-chair-check-boundaries",
    },
    onePager: {
      slug: "boundaries-referral-script",
      title: `${ESSENTIALS_PLACEHOLDER_MARK} Chair-side: Know Your Boundaries`,
      markdownFile: "know-your-boundaries.md",
      pdfFile: "know-your-boundaries.pdf",
    },
  },
];

/** Portable storage path (slug-based). Prefer this for ElevenLabs VO drops. */
export function essentialsLessonVideoPath(
  lessonSlug: string,
  filename = "vo.mp4",
) {
  return `courses/${ESSENTIALS_COURSE_SLUG}/lessons/${lessonSlug}/${filename}`;
}

/** Admin upload path already used by /api/media/upload (cuid-based). */
export function essentialsAdminLessonMediaPrefix(courseId: string, lessonId: string) {
  return `courses/${courseId}/lessons/${lessonId}`;
}

export function essentialsOnePagerStoragePath(moduleSlug: string) {
  return `courses/${ESSENTIALS_COURSE_SLUG}/downloads/${moduleSlug}-chair-side.pdf`;
}

export function matchByTitleIncludes(title: string, needles: string | string[]) {
  const haystack = title.toLowerCase();
  const list = Array.isArray(needles) ? needles : [needles];
  return list.some((needle) => haystack.includes(needle.toLowerCase()));
}

export function findEssentialsModuleSpec(moduleTitle: string) {
  return (
    ESSENTIALS_MODULES.find((mod) =>
      matchByTitleIncludes(moduleTitle, mod.titleIncludes),
    ) ?? null
  );
}

export function findEssentialsLessonSpec(moduleTitle: string, lessonTitle: string) {
  const mod = findEssentialsModuleSpec(moduleTitle);
  if (!mod) return null;
  return (
    mod.lessons.find((lesson) => matchByTitleIncludes(lessonTitle, lesson.titleIncludes)) ??
    null
  );
}

export function lastLessonOfModule<T extends { position: number }>(lessons: T[]) {
  if (lessons.length === 0) return null;
  return lessons.reduce((best, lesson) =>
    lesson.position > best.position ? lesson : best,
  );
}
