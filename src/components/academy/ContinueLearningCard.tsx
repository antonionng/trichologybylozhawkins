"use client";

import Link from "next/link";

type Props = {
  continueLesson: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    lessonNumber: number;
    totalLessons: number;
  } | null;
  hasEnrolledCourses: boolean;
};

export function ContinueLearningCard({
  continueLesson,
  hasEnrolledCourses,
}: Props) {
  if (!continueLesson && !hasEnrolledCourses) return null;

  if (!continueLesson && hasEnrolledCourses) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-6 w-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-emerald-900">
              All caught up!
            </p>
            <p className="text-sm text-emerald-700/70">
              You&apos;ve completed all available lessons. Check back for new content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!continueLesson) return null;

  const pct =
    continueLesson.totalLessons > 0
      ? Math.round(
          ((continueLesson.lessonNumber - 1) / continueLesson.totalLessons) *
            100,
        )
      : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#fab826]/15 bg-gradient-to-br from-[#fab826]/5 via-white to-[#fab826]/3 shadow-sm">
      <div className="p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b67400]/50">
          Continue Learning
        </p>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-black/45">{continueLesson.courseTitle}</p>
            <h3 className="mt-1 text-lg font-semibold text-black leading-snug">
              {continueLesson.lessonTitle}
            </h3>
            <p className="mt-1 text-sm text-black/50">
              {continueLesson.moduleTitle} &middot; Lesson{" "}
              {continueLesson.lessonNumber} of {continueLesson.totalLessons}
            </p>
          </div>

          <Link
            href={`/academy/${continueLesson.courseId}/lessons/${continueLesson.lessonId}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fab826] text-white shadow-md transition hover:bg-[#e5a820] hover:shadow-lg"
          >
            <svg
              className="ml-0.5 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-black/40">Course progress</span>
            <span className="font-semibold text-[#b67400]">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-[#fab826] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
