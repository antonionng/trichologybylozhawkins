"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { photography } from "@/lib/visualAssets";
import { ProgressRing } from "./ProgressRing";
import { ContinueLearningCard } from "./ContinueLearningCard";
import { LearningMetrics } from "./LearningMetrics";
import { ActivityFeed } from "./ActivityFeed";

type CourseCard = {
  id: string;
  title: string;
  slug?: string;
  subtitle?: string | null;
  description?: string | null;
  level?: string | null;
  enrollmentType?: string | null;
  durationMinutes?: number | null;
  heroUrl?: string | null;
  tagline?: string | null;
  learningOutcomes?: string[];
  completedLessons?: number;
  totalLessons?: number;
  pricing?: Array<{
    id: string;
    amount: any;
    currency: string;
    isPrimary: boolean;
  }>;
};

type QuizCard = {
  id: string;
  title: string;
  description?: string | null;
  passingScore: number;
  course?: { title: string };
  _count?: { questions: number };
};

type VideoCard = {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  durationMinutes?: number | null;
  heroUrl?: string | null;
  pricing?: Array<{
    id: string;
    amount: any;
    currency: string;
    isPrimary: boolean;
  }>;
};

type ActivityItem = {
  type: "lesson" | "quiz";
  title: string;
  context: string;
  date: string;
  score?: number;
  passed?: boolean;
};

type Props = {
  myCourses: CourseCard[];
  browseCourses: CourseCard[];
  quizzes: QuizCard[];
  myVideos: VideoCard[];
  browseVideos: VideoCard[];
  userName?: string | null;
  stats: {
    coursesEnrolled: number;
    lessonsCompleted: number;
    quizzesPassed: number;
    videosWatched: number;
    learningTimeMinutes: number;
    overallProgress: number;
  };
  continueLesson: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    lessonNumber: number;
    totalLessons: number;
  } | null;
  recentActivity: ActivityItem[];
  weeklyStats: { thisWeek: number; lastWeek: number };
  quizMetrics: {
    bestScore: number | null;
    bestQuizTitle: string | null;
    avgScore: number | null;
  };
  streak: number;
  nextMilestone: string | null;
};

type TabKey = "library" | "browse" | "videos" | "quizzes" | "shop";

function formatLevel(level?: string | null) {
  if (!level) return null;
  return level.charAt(0) + level.slice(1).toLowerCase();
}

const GRADIENTS = [
  "from-brand-salmon/20 to-brand-clay/20",
  "from-brand-sage/25 to-brand-mist/20",
  "from-brand-mist/25 to-brand-clay/15",
  "from-brand-clay/20 to-brand-salmon/15",
  "from-brand-sage/20 to-brand-salmon/15",
];

const VALID_TABS: TabKey[] = ["library", "browse", "videos", "quizzes", "shop"];

const MOTIVATIONAL_QUOTES = [
  "Every lesson brings you closer to the practitioner your clients need.",
  "Knowledge is the foundation of confidence \u2014 keep building yours.",
  "Your commitment to learning sets you apart in this industry.",
  "The best trichologists never stop learning. You\u2019re on the right path.",
];

export function AcademyTabs({
  myCourses,
  browseCourses,
  quizzes,
  myVideos,
  browseVideos,
  userName,
  stats,
  continueLesson,
  recentActivity,
  weeklyStats,
  quizMetrics,
  streak,
  nextMilestone,
}: Props) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") as TabKey | null;
  const tab: TabKey =
    rawTab && VALID_TABS.includes(rawTab) ? rawTab : "library";

  const featuredQuizHref = "/quiz/trichology-knowledge-check";

  const quote = useMemo(
    () =>
      MOTIVATIONAL_QUOTES[
        Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ],
    [],
  );

  const hasActivity =
    stats.coursesEnrolled > 0 || stats.lessonsCompleted > 0;

  const showContinueLearningColumn =
    continueLesson != null || stats.coursesEnrolled > 0;

  const hasRecentActivity = recentActivity.length > 0;
  const hasMyCourses = myCourses.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner with Lorraine + Progress Ring */}
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-[#fab826]/8 via-white to-[#fab826]/5">
        <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b67400]/60">
              Your Learning Hub
            </p>
            <h1 className="text-2xl font-bold text-black sm:text-3xl">
              {userName
                ? `Welcome back, ${userName}`
                : "Welcome to your learning hub"}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-black/55 italic">
              &ldquo;{quote}&rdquo;
              <span className="ml-2 not-italic text-[#b67400]/60">
                &mdash; Lorraine
              </span>
            </p>

            {/* Stats summary row */}
            {hasActivity && (
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fab826]/15">
                    <svg className="h-4 w-4 text-[#fab826]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold text-black leading-none">
                      {stats.coursesEnrolled}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-black/40">
                      Courses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold text-black leading-none">
                      {stats.lessonsCompleted}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-black/40">
                      Lessons
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold text-black leading-none">
                      {stats.quizzesPassed}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-black/40">
                      Quizzes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
                    <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold text-black leading-none">
                      {stats.videosWatched}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-black/40">
                      Videos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lorraine's photo + progress ring */}
          <div className="hidden items-center gap-5 md:flex">
            {hasActivity && stats.overallProgress > 0 && (
              <ProgressRing
                percent={stats.overallProgress}
                size={100}
                strokeWidth={8}
                label="Complete"
              />
            )}
            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-[#fab826]/20 shadow-lg">
              <Image
                src={photography.hero.src}
                alt={photography.hero.alt}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#fab826]/5" />
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { id: "library", label: "My Library" },
          { id: "browse", label: "Browse Courses" },
          { id: "videos", label: "Videos" },
          { id: "quizzes", label: "Quizzes" },
          { id: "shop", label: "Shop" },
        ] as const).map((tabItem) => (
          <Link
            key={tabItem.id}
            href={`/academy?tab=${tabItem.id}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              tab === tabItem.id ? "bg-brand-graphite text-white" : "bg-black/5 text-black/65"
            }`}
          >
            {tabItem.label}
          </Link>
        ))}
      </div>

      {/* ── MY LIBRARY (Dashboard) ── */}
      {tab === "library" ? (
        <div className="w-full space-y-6">
          {/* Continue Learning + Metrics side by side on large screens */}
          {hasActivity ? (
            <>
              <div
                className={
                  showContinueLearningColumn
                    ? "grid gap-6 lg:grid-cols-[1fr_1.2fr]"
                    : "grid gap-6"
                }
              >
                {showContinueLearningColumn && (
                  <ContinueLearningCard
                    continueLesson={continueLesson}
                    hasEnrolledCourses={stats.coursesEnrolled > 0}
                  />
                )}
                <LearningMetrics
                  weeklyStats={weeklyStats}
                  quizMetrics={quizMetrics}
                  streak={streak}
                  nextMilestone={nextMilestone}
                  videosWatched={stats.videosWatched}
                  learningTimeMinutes={stats.learningTimeMinutes}
                />
              </div>

              {/* Activity Feed + Course cards */}
              {(hasRecentActivity || hasMyCourses) && (
                <div
                  className={
                    hasRecentActivity && hasMyCourses
                      ? "grid gap-6 lg:grid-cols-[1fr_1.6fr]"
                      : "grid gap-6"
                  }
                >
                  {hasRecentActivity && (
                    <ActivityFeed items={recentActivity} />
                  )}

                  {hasMyCourses && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/40">
                        My Courses
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {myCourses.map((course, i) => {
                          const completed = course.completedLessons ?? 0;
                          const total = course.totalLessons ?? 0;
                          const pct =
                            total > 0
                              ? Math.round((completed / total) * 100)
                              : 0;
                          const isAllDone =
                            total > 0 && completed >= total;

                          return (
                            <div
                              key={course.id}
                              className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-card"
                            >
                              <div
                                className={`relative h-36 w-full overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                              >
                                {course.heroUrl && (
                                  <img
                                    src={course.heroUrl}
                                    alt={course.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/60 backdrop-blur-sm">
                                    {course.enrollmentType?.replace(
                                      /_/g,
                                      " ",
                                    ) ?? "Course"}
                                  </span>
                                  {isAllDone && (
                                    <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-1 flex-col p-4">
                                <h2 className="text-base font-semibold text-black leading-snug">
                                  {course.title}
                                </h2>
                                <p className="mt-1 text-sm text-black/55 line-clamp-1">
                                  {course.subtitle ??
                                    course.description ??
                                    ""}
                                </p>

                                {total > 0 && (
                                  <div className="mt-3 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-black/50">
                                        {completed} of {total} lessons
                                      </span>
                                      <span
                                        className={`font-semibold ${isAllDone ? "text-emerald-600" : "text-[#b67400]"}`}
                                      >
                                        {pct}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          isAllDone
                                            ? "bg-emerald-500"
                                            : "bg-[#fab826]"
                                        }`}
                                        style={{
                                          width: `${pct}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="mt-auto pt-3">
                                  <Link
                                    href={`/education/${course.slug}`}
                                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                                      isAllDone
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                        : "bg-[#fab826] text-white shadow-sm hover:bg-[#e5a820]"
                                    }`}
                                  >
                                    {isAllDone
                                      ? "Review Course"
                                      : "Continue"}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ── Empty state: no courses enrolled yet ── */
            <div className="space-y-6">
              {/* Featured quiz CTA */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col justify-center rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 to-white p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-purple-400">
                    Free Assessment
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-black">
                    Test Your Trichology Knowledge
                  </h3>
                  <p className="mt-1.5 text-sm text-black/55">
                    Take a quick quiz and get a personalised breakdown of your
                    strengths and knowledge gaps &mdash; no enrolment
                    needed.
                  </p>
                  <Link
                    href={featuredQuizHref}
                    className="mt-4 inline-flex w-fit items-center justify-center rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-purple-700"
                  >
                    Take the quiz
                  </Link>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#fab826]/20 bg-[#fab826]/5 px-8 py-10 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fab826]/15">
                    <svg
                      className="h-8 w-8 text-[#fab826]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-black">
                    Your learning journey begins here
                  </p>
                  <p className="mt-2 max-w-md text-sm text-black/55 italic">
                    &ldquo;I&apos;ve designed each course to give you the
                    knowledge and confidence to transform your practice.
                    Browse our courses and take the first step.&rdquo;
                    <span className="ml-1 not-italic text-[#b67400]/60">
                      &mdash; Lorraine
                    </span>
                  </p>
                  <Link
                    href="/academy?tab=browse"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#fab826] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>

              {/* Preview of available courses */}
              {browseCourses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/40">
                    What you&apos;ll achieve
                  </p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {browseCourses.slice(0, 3).map((course, i) => (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                      >
                        <div
                          className={`mb-3 h-2 w-12 rounded-full bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]}`}
                        />
                        <h3 className="text-base font-semibold text-black">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm text-black/50 line-clamp-2">
                          {course.tagline ??
                            course.subtitle ??
                            course.description ??
                            ""}
                        </p>
                        {course.learningOutcomes &&
                          course.learningOutcomes.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {course.learningOutcomes
                                .slice(0, 2)
                                .map((outcome, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-xs text-black/50"
                                  >
                                    <svg
                                      className="mt-0.5 h-3 w-3 shrink-0 text-brand-sage"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2.5}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <span>{outcome}</span>
                                  </li>
                                ))}
                            </ul>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ── BROWSE COURSES ── */}
      {tab === "browse" ? (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {browseCourses.map((course, i) => (
              <div
                key={course.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-card"
              >
                <div
                  className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                >
                  {course.heroUrl && (
                    <img
                      src={course.heroUrl}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/60 backdrop-blur-sm">
                      {course.enrollmentType?.replace(/_/g, " ") ?? "Course"}
                    </span>
                    {formatLevel(course.level) && (
                      <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                        {formatLevel(course.level)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-xl font-semibold text-black leading-snug">
                    {course.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-black/60">
                    {course.tagline ??
                      course.subtitle ??
                      course.description ??
                      ""}
                  </p>

                  {course.learningOutcomes &&
                    course.learningOutcomes.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                          What you&apos;ll learn
                        </p>
                        <ul className="space-y-1">
                          {course.learningOutcomes
                            .slice(0, 3)
                            .map((outcome, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-black/55"
                              >
                                <svg
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-sage"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{outcome}</span>
                              </li>
                            ))}
                          {course.learningOutcomes.length > 3 && (
                            <li className="pl-5 text-xs text-black/40">
                              +{course.learningOutcomes.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-black/45">
                    {course.durationMinutes && course.durationMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" d="M12 7v5l3 3" />
                        </svg>
                        {course.durationMinutes >= 60
                          ? `${Math.round(course.durationMinutes / 60)}h ${course.durationMinutes % 60 > 0 ? `${course.durationMinutes % 60}m` : ""}`
                          : `${course.durationMinutes}m`}
                      </span>
                    )}
                    {course.enrollmentType && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {course.enrollmentType === "ON_DEMAND"
                          ? "Self-paced"
                          : course.enrollmentType === "COHORT"
                            ? "Live cohort"
                            : course.enrollmentType?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/education/${course.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#fab826] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
                    >
                      View course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {browseCourses.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-8 py-14 text-center">
              <p className="text-base font-medium text-black/70">
                You&apos;ve enrolled in everything!
              </p>
              <p className="mt-1 text-sm text-black/45">
                Check back later for new courses.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── VIDEOS ── */}
      {tab === "videos" ? (
        <div className="space-y-10">
          {myVideos.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
                My videos
              </p>
              <div className="grid gap-6 lg:grid-cols-3">
                {myVideos.map((video, i) => (
                  <div
                    key={video.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-card"
                  >
                    <div
                      className={`relative h-36 w-full overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                    >
                      {video.heroUrl && (
                        <img
                          src={video.heroUrl}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/60 backdrop-blur-sm">
                          {video.category ?? "Video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-semibold text-black leading-snug">
                        {video.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-black/55 line-clamp-2">
                        {video.subtitle ?? video.description ?? ""}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-black/40">
                        <span>
                          {video.durationMinutes
                            ? `${video.durationMinutes} mins`
                            : ""}
                        </span>
                        <Link
                          href={`/education/videos/${video.slug}`}
                          className="rounded-xl bg-brand-graphite px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-brand-graphite/85"
                        >
                          View video
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {browseVideos.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
                {myVideos.length > 0
                  ? "More videos to explore"
                  : "Video courses"}
              </p>
              <div className="grid gap-6 lg:grid-cols-3">
                {browseVideos.map((video, i) => (
                  <div
                    key={video.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-card"
                  >
                    <div
                      className={`relative h-36 w-full overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                    >
                      {video.heroUrl && (
                        <img
                          src={video.heroUrl}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/60 backdrop-blur-sm">
                          {video.category ?? "Video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-semibold text-black leading-snug">
                        {video.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-black/55 line-clamp-2">
                        {video.subtitle ?? video.description ?? ""}
                      </p>
                      <div className="mt-auto pt-4">
                        <Link
                          href={`/education/videos/${video.slug}`}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-graphite px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-brand-graphite/85"
                        >
                          View video
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myVideos.length === 0 && browseVideos.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-8 py-14 text-center">
              <p className="text-base font-medium text-black/70">
                No video courses available right now.
              </p>
              <p className="mt-1 text-sm text-black/45">
                Check back soon for new content.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── QUIZZES ── */}
      {tab === "quizzes" ? (
        <div className="space-y-6">
          <Surface
            variant="glass"
            padding="lg"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Featured
              </p>
              <h2 className="text-xl font-semibold text-black">
                Trichology Knowledge Check
              </h2>
              <p className="mt-1 text-sm text-black/60">
                Take the quick assessment and get a personalised breakdown
                of your strengths and gaps.
              </p>
            </div>
            <Link
              href={featuredQuizHref}
              className="rounded-xl bg-[#fab826] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#e5a820]"
            >
              Take quiz
            </Link>
          </Surface>

          <div className="grid gap-4 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Surface
                key={quiz.id}
                variant="card"
                padding="lg"
                className="space-y-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                    {quiz.course?.title ?? "Quiz"}
                  </p>
                  <h3 className="text-lg font-semibold text-black">
                    {quiz.title}
                  </h3>
                  {quiz.description ? (
                    <p className="mt-1 text-sm text-black/60 line-clamp-2">
                      {quiz.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-xs text-black/50">
                    {quiz._count?.questions ?? 0} questions &middot; Pass{" "}
                    {quiz.passingScore}%
                  </div>
                  <Link
                    href={`/academy/quizzes/${quiz.id}`}
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b67400] hover:underline"
                  >
                    Take
                  </Link>
                </div>
              </Surface>
            ))}

            {quizzes.length === 0 ? (
              <div className="py-10 text-center lg:col-span-3">
                <p className="text-sm text-black/60">
                  No quizzes published yet.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "shop" ? (
        <div className="space-y-6">
          <Surface variant="glass" padding="lg" className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Academy Shop</p>
            <h2 className="text-2xl font-semibold text-black">Saco Supernature Product Store</h2>
            <p className="max-w-2xl text-sm text-black/60">
              Purchase the same professional products Lorraine recommends in education. Browse shampoos, conditioners, masks, and styling essentials.
            </p>
            <Link
              href="/shop"
              className="inline-flex rounded-xl bg-brand-graphite px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Open full shop
            </Link>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}
