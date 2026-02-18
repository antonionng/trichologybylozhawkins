export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizTaker } from "@/components/education/QuizTaker";
import { requireUserOrRedirect } from "@/server/security/auth";

interface Props {
  params: { quizId: string };
}

async function getQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id, status: "PUBLISHED", isPublic: false },
    include: {
      course: { select: { id: true, title: true, slug: true } },
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#fff9ed] to-[#ffe8d6] py-12">
      <div className="mx-auto max-w-3xl px-6">
        <QuizTaker quiz={quiz} />
      </div>
    </main>
  );
}

