"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LessonKnowledgeCheck } from "./LessonKnowledgeCheck";
import { markLessonComplete } from "@/app/actions/education";

type KnowledgeQuestion = {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Props = {
  lessonId: string;
  courseId: string;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  prevLessonId: string | null;
  prevLessonTitle: string | null;
  isCompleted: boolean;
  knowledgeCheck: KnowledgeQuestion[] | null;
  moduleQuizId: string | null;
  moduleQuizTitle: string | null;
  moduleQuizPassed: boolean;
  isLastInModule: boolean;
};

export function LessonGate({
  lessonId,
  courseId,
  nextLessonId,
  nextLessonTitle,
  prevLessonId,
  prevLessonTitle,
  isCompleted,
  knowledgeCheck,
  moduleQuizId,
  moduleQuizTitle,
  moduleQuizPassed,
  isLastInModule,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const hasKnowledgeCheck = knowledgeCheck && knowledgeCheck.length > 0;
  const needsModuleQuiz = isLastInModule && moduleQuizId && !moduleQuizPassed;
  const canProceed = isCompleted && (!needsModuleQuiz || moduleQuizPassed);

  const handleKnowledgeCheckComplete = () => {
    startTransition(async () => {
      await markLessonComplete(lessonId, courseId);
    });
  };

  const handleMarkComplete = () => {
    startTransition(async () => {
      await markLessonComplete(lessonId, courseId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Knowledge check section */}
      {hasKnowledgeCheck && !isCompleted && (
        <LessonKnowledgeCheck
          questions={knowledgeCheck}
          onComplete={handleKnowledgeCheckComplete}
        />
      )}

      {/* Completed badge for knowledge check */}
      {hasKnowledgeCheck && isCompleted && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm">✓</span>
          <div>
            <p className="font-semibold text-emerald-800">Knowledge Check Complete</p>
            <p className="text-sm text-emerald-600">Well done — you've mastered this lesson.</p>
          </div>
        </div>
      )}

      {/* Mark complete button (only when no knowledge check) */}
      {!hasKnowledgeCheck && !isCompleted && (
        <button
          onClick={handleMarkComplete}
          disabled={isPending}
          className="w-full rounded-2xl bg-[#fab826] px-6 py-4 text-center font-semibold text-white shadow-md transition hover:bg-[#e5a820] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Mark Lesson Complete ✓"}
        </button>
      )}

      {/* Module quiz prompt (last lesson of module, quiz not passed) */}
      {isCompleted && needsModuleQuiz && (
        <div className="rounded-2xl border border-[#fab826]/30 bg-gradient-to-r from-[#fab826]/10 to-transparent p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fab826]/20 text-xl">📝</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black">Module Assessment Required</h3>
              <p className="mt-1 text-sm text-black/60">
                Complete the <span className="font-medium">{moduleQuizTitle}</span> to unlock the next module.
              </p>
              <Link
                href={`/academy/quizzes/${moduleQuizId}`}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#fab826] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e5a820]"
              >
                Take Module Quiz →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Module quiz passed badge */}
      {isLastInModule && moduleQuizId && moduleQuizPassed && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#fab826]/20 bg-[#fab826]/5 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fab826] text-white text-sm">★</span>
          <div>
            <p className="font-semibold text-[#b67400]">Module Quiz Passed</p>
            <p className="text-sm text-[#b67400]/70">You&apos;ve completed this module&apos;s assessment.</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-stretch gap-4">
        {prevLessonId ? (
          <Link
            href={`/academy/${courseId}/lessons/${prevLessonId}`}
            className="group flex flex-1 items-center gap-3 rounded-2xl border border-black/5 bg-white p-5 transition hover:border-black/10 hover:shadow-sm"
          >
            <span className="text-xl text-black/20 group-hover:text-black/40">←</span>
            <div className="min-w-0">
              <p className="truncate text-xs text-black/40">Previous</p>
              <p className="truncate font-medium text-black">{prevLessonTitle}</p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextLessonId ? (
          canProceed ? (
            <Link
              href={`/academy/${courseId}/lessons/${nextLessonId}`}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#fab826] px-6 py-5 text-center font-semibold text-white shadow-md transition hover:bg-[#e5a820] hover:shadow-lg"
            >
              <span>Continue to Next Lesson</span>
              <span className="text-lg">→</span>
            </Link>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-black/5 px-6 py-5 text-center text-sm text-black/40 cursor-not-allowed">
              {!isCompleted
                ? "Complete the knowledge check to continue"
                : "Pass the module quiz to continue"}
            </div>
          )
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
