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
    description: string;
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
      title: "Chair-check: Recognising Common Scalp Concerns",
      slug: "essentials-chair-check-scalp-concerns",
      description:
        "End-of-module chair-check for Lessons 1-2. Supportive, not exam-scary. What would you say next?",
    },
    onePager: {
      slug: "scalp-hair-quick-screen",
      title: "Scalp & hair quick screen (salon chair)",
      markdownFile: "scalp-hair-quick-screen.md",
      pdfFile: "scalp-hair-quick-screen.pdf",
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
      title: "Chair-check: Client Conversations That Build Trust",
      slug: "essentials-chair-check-client-conversations",
      description:
        "End-of-module chair-check for Lessons 3-4. Supportive, not exam-scary. What would you say next?",
    },
    onePager: {
      slug: "chair-language-crib-sheet",
      title: "Chair language crib sheet",
      markdownFile: "chair-language-crib-sheet.md",
      pdfFile: "chair-language-crib-sheet.pdf",
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
      title: "Chair-check: Know Your Boundaries",
      slug: "essentials-chair-check-boundaries",
      description:
        "End-of-module chair-check for Lesson 5. Supportive, not exam-scary. Scope and referral.",
    },
    onePager: {
      slug: "scope-referral-pathway",
      title: "Scope of practice & referral pathway",
      markdownFile: "scope-referral-pathway.md",
      pdfFile: "scope-referral-pathway.pdf",
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

export function essentialsOnePagerStoragePath(onePagerSlug: string) {
  return `courses/${ESSENTIALS_COURSE_SLUG}/downloads/${onePagerSlug}.pdf`;
}

export const ESSENTIALS_CONTENT_DIR = "content/essentials";
export const ESSENTIALS_VO_DIR = "content/essentials/vo";
export const ESSENTIALS_ONE_PAGER_DIR = "content/essentials/one-pagers";
export const ESSENTIALS_CHAIR_CHECKS_MD = "content/essentials/chair-checks.md";

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
