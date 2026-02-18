import { prisma } from "@/server/db/client";

export type UpsellCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  enrollmentType: string;
  primaryPrice: { id: string; amount: any; currency: string } | null;
};

export type UpsellCourseWithReason = UpsellCourse & { reason: string };

type RankedCourse = {
  pinnedRank: number; // 0 = recommendedCourseId, 1 = quiz course, 2 = rest
  matchScore: number;
  createdAt: Date;
  course: any;
};

function toUpsellCourse(course: {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: any;
  enrollmentType: any;
  pricing: Array<{ id: string; amount: any; currency: string; isPrimary: boolean }>;
}): UpsellCourse {
  const primary =
    course.pricing.find((p) => p.isPrimary) ?? course.pricing[0] ?? null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle ?? null,
    description: course.description ?? null,
    level: String(course.level ?? ""),
    enrollmentType: String(course.enrollmentType ?? ""),
    primaryPrice: primary
      ? { id: primary.id, amount: primary.amount, currency: primary.currency }
      : null,
  };
}

function summarizeFocus(input?: { gaps?: string[] | null; nextSteps?: string[] | null }) {
  const gaps = Array.isArray(input?.gaps) ? input!.gaps : [];
  const steps = Array.isArray(input?.nextSteps) ? input!.nextSteps : [];

  const pick = (arr: string[]) =>
    arr
      .map((s) => String(s ?? "").trim())
      .filter(Boolean)
      .slice(0, 2);

  const parts = [...pick(gaps), ...pick(steps)].slice(0, 2);
  return parts.length ? parts.join(" • ") : null;
}

function normalizeToken(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  const norm = normalizeToken(text);
  if (!norm) return [];
  const stop = new Set([
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "a",
    "an",
    "with",
    "your",
    "you",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "as",
    "at",
    "by",
    "from",
    "when",
    "how",
    "what",
    "why",
    "into",
    "over",
    "under",
    "about",
    "within",
    "between",
  ]);
  return norm
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));
}

function ngrams(tokens: string[], n: number) {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

function buildSignals(aiFeedback?: { gaps?: string[]; nextSteps?: string[] } | null) {
  const gaps = Array.isArray(aiFeedback?.gaps) ? aiFeedback!.gaps : [];
  const nextSteps = Array.isArray(aiFeedback?.nextSteps) ? aiFeedback!.nextSteps : [];
  const raw = [...gaps, ...nextSteps].map((s) => String(s ?? "")).filter(Boolean);
  const tokens = raw.flatMap(tokenize);
  const bigrams = ngrams(tokens, 2);
  const all = [...tokens, ...bigrams];
  // Weight gaps slightly higher by duplicating their tokens.
  const gapTokens = gaps.flatMap(tokenize);
  const weighted = [...all, ...gapTokens];
  return {
    raw,
    tokens: Array.from(new Set(tokens)),
    weighted,
  };
}

function courseTextBlob(course: any) {
  const parts: string[] = [];
  for (const v of [
    course.title,
    course.subtitle,
    course.description,
    course.category,
    ...(Array.isArray(course.learningOutcomes) ? course.learningOutcomes : []),
    ...(Array.isArray(course.targetAudience) ? course.targetAudience : []),
    ...(Array.isArray(course.requirements) ? course.requirements : []),
    ...(Array.isArray(course.conditions) ? course.conditions.map((c: any) => c?.condition?.name ?? c?.condition?.title ?? c?.condition?.slug ?? "") : []),
  ]) {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
  }
  return parts.join(" • ");
}

function computeMatch(course: any, signals: ReturnType<typeof buildSignals>) {
  const blob = courseTextBlob(course);
  const blobNorm = normalizeToken(blob);
  if (!blobNorm) return { score: 0, hits: [] as string[] };

  let score = 0;
  const hits: Array<{ term: string; weight: number }> = [];

  for (const term of signals.weighted) {
    if (!term) continue;
    const isBigram = term.includes(" ");
    const weight = isBigram ? 6 : 3;
    const present = blobNorm.includes(term);
    if (present) {
      score += weight;
      hits.push({ term, weight });
    }
  }

  // Keep top 2-3 distinct hits for copy.
  const seen = new Set<string>();
  const top = hits
    .sort((a, b) => b.weight - a.weight)
    .map((h) => h.term)
    .filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    })
    .slice(0, 3);

  return { score, hits: top };
}

function reasonForCourse(options: {
  courseTitle: string;
  isRecommended: boolean;
  isQuizCourse: boolean;
  band?: "low" | "medium" | "high";
  focusSummary?: string | null;
  recommendedBlurb?: string | null;
  matchHits?: string[];
}) {
  if (options.isRecommended && options.recommendedBlurb) {
    return options.recommendedBlurb;
  }

  const focus = options.focusSummary ? ` Focus areas: ${options.focusSummary}.` : "";
  const hits =
    options.matchHits && options.matchHits.length
      ? ` This supports: ${options.matchHits.slice(0, 2).join(" • ")}.`
      : "";

  if (options.isRecommended) {
    return `Recommended based on your results.${focus}${hits}`;
  }

  if (options.isQuizCourse) {
    return `This is the course this quiz belongs to — ideal to strengthen the same topics and improve your score.${focus}${hits}`;
  }

  if (options.band === "low") {
    return `A strong next step to build foundations and close gaps efficiently.${focus}${hits}`;
  }

  if (options.band === "high") {
    return `Great if you want to go deeper and extend what you already know.${focus}${hits}`;
  }

  return `A solid follow-on course to deepen understanding and tighten up any weak spots.${focus}${hits}`;
}

export async function getQuizUpsellCourses(options: {
  quizId: string;
  limit?: number;
}): Promise<UpsellCourse[]> {
  const limit = Math.max(0, Math.min(options.limit ?? 3, 6));
  if (!limit) return [];

  const quiz = await prisma.quiz.findUnique({
    where: { id: options.quizId },
    select: { courseId: true, recommendedCourseId: true },
  });

  if (!quiz) return [];

  const preferredIds = Array.from(
    new Set([quiz.recommendedCourseId, quiz.courseId].filter(Boolean))
  ) as string[];

  const include = {
    pricing: {
      orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
      select: { id: true, amount: true, currency: true, isPrimary: true },
    },
  };

  const preferredCourses = preferredIds.length
    ? await prisma.course.findMany({
        where: { id: { in: preferredIds }, status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          description: true,
          level: true,
          enrollmentType: true,
          ...include,
        },
      })
    : [];

  const remaining = Math.max(0, limit - preferredCourses.length);
  const fillerCourses =
    remaining > 0
      ? await prisma.course.findMany({
          where: {
            status: "PUBLISHED",
            ...(preferredIds.length ? { id: { notIn: preferredIds } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: remaining,
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            description: true,
            level: true,
            enrollmentType: true,
            ...include,
          },
        })
      : [];

  // Preserve intent order: recommended course first (if present), then the quiz's own course.
  const preferredById = new Map(preferredCourses.map((c) => [c.id, c]));
  const orderedPreferred = preferredIds
    .map((id) => preferredById.get(id))
    .filter(Boolean) as typeof preferredCourses;

  return [...orderedPreferred, ...fillerCourses].map(toUpsellCourse);
}

export async function getQuizUpsellCoursesWithReasons(options: {
  quizId: string;
  band?: "low" | "medium" | "high";
  aiFeedback?: { gaps?: string[]; nextSteps?: string[]; recommendedCourseBlurb?: string } | null;
}): Promise<UpsellCourseWithReason[]> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: options.quizId },
    select: { courseId: true, recommendedCourseId: true },
  });
  if (!quiz) return [];

  const signals = buildSignals(options.aiFeedback ?? null);
  const focusSummary = summarizeFocus(options.aiFeedback);
  const recommendedBlurb = options.aiFeedback?.recommendedCourseBlurb ?? null;

  const preferredIds = Array.from(
    new Set([quiz.recommendedCourseId, quiz.courseId].filter(Boolean))
  ) as string[];

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      level: true,
      enrollmentType: true,
      category: true,
      learningOutcomes: true,
      requirements: true,
      targetAudience: true,
      conditions: {
        select: {
          condition: { select: { slug: true, name: true, title: true } },
        },
      },
      pricing: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        select: { id: true, amount: true, currency: true, isPrimary: true },
      },
    },
  });

  const byId = new Map(courses.map((c) => [c.id, c]));
  const orderedPreferred = preferredIds
    .map((id) => byId.get(id))
    .filter(Boolean) as typeof courses;

  const preferredSet = new Set(preferredIds);
  const rest = courses.filter((c) => !preferredSet.has(c.id));

  const ranked: RankedCourse[] = [...orderedPreferred, ...rest].map((c) => {
    const pinnedRank = quiz.recommendedCourseId && c.id === quiz.recommendedCourseId ? 0 : c.id === quiz.courseId ? 1 : 2;
    const match = signals.tokens.length ? computeMatch(c, signals) : { score: 0, hits: [] as string[] };
    return { pinnedRank, matchScore: match.score, createdAt: c.createdAt, course: { ...c, __matchHits: match.hits } };
  });

  ranked.sort((a, b) => {
    if (a.pinnedRank !== b.pinnedRank) return a.pinnedRank - b.pinnedRank;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return ranked.map((r) => {
    const c = r.course;
    const base = toUpsellCourse(c);
    const isRecommended = Boolean(quiz.recommendedCourseId && c.id === quiz.recommendedCourseId);
    const isQuizCourse = c.id === quiz.courseId;
    return {
      ...base,
      reason: reasonForCourse({
        courseTitle: base.title,
        isRecommended,
        isQuizCourse,
        band: options.band,
        focusSummary,
        recommendedBlurb: isRecommended ? recommendedBlurb : null,
        matchHits: Array.isArray(c.__matchHits) ? c.__matchHits : [],
      }),
    };
  });
}

