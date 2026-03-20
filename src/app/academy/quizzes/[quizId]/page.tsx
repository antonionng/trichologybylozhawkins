export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizTaker } from "@/components/education/QuizTaker";
import { QuizPageShell } from "@/components/education/QuizPageShell";
import { Surface } from "@/components/layout/Surface";
import { resolveQuizCardImageUrl } from "@/server/modules/education/quizHero";
import { requireUserOrRedirect } from "@/server/security/auth";

interface Props {
  params: { quizId: string };
}

async function getQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id, status: "PUBLISHED", isPublic: false },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      heroMedia: { select: { path: true } },
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          position: true,
          questionText: true,
          questionType: true,
          options: true,
          points: true,
          // Don't include correctAnswer - that stays server-side
        },
      },
    },
  });
}

export default async function AcademyQuizPage({ params }: Props) {
  await requireUserOrRedirect({ next: `/academy/quizzes/${params.quizId}` });
  const quiz = await getQuiz(params.quizId);

  if (!quiz) {
    notFound();
  }

  const quizHeroUrl = await resolveQuizCardImageUrl(quiz);

  return (
    <QuizPageShell
      variant="academy"
      eyebrow={quiz.course.title}
      title={quiz.title}
      description={
        quiz.description ??
        "Review the overview, then start when you are ready."
      }
      backHref="/academy?tab=quizzes"
      backLabel="Back to quizzes"
      heroUrl={quizHeroUrl}
      heroAlt={quiz.title}
      stats={[
        { label: "Questions", value: quiz.questions.length },
        { label: "Pass mark", value: `${quiz.passingScore}%` },
        {
          label: "Time limit",
          value: quiz.timeLimit ? `${quiz.timeLimit}m` : "None",
        },
      ]}
      supportingPanel={
        <Surface variant="card" padding="md" className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-graphite/40">
            Assessment focus
          </p>
          <p className="text-sm leading-relaxed text-brand-graphite/70">
            Use this quiz to check your understanding before moving on. Your
            answers are scored automatically and your review stays inside the
            academy flow.
          </p>
        </Surface>
      }
    >
        <QuizTaker quiz={quiz} />
    </QuizPageShell>
  );
}

