export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizEditor } from "@/components/dashboard/education/QuizEditor";
import { resolveQuizCardImageUrl } from "@/server/modules/education/quizHero";

interface Props {
  params: { quizId: string };
}

async function getQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      heroMedia: { select: { id: true, path: true } },
      questions: { orderBy: { position: "asc" } },
      _count: { select: { attempts: true } },
      recommendedCourse: { select: { id: true, title: true } },
    },
  });
}

async function getCourses() {
  return prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

export default async function QuizEditorPage({ params }: Props) {
  const [quiz, courses] = await Promise.all([
    getQuiz(params.quizId),
    getCourses(),
  ]);

  if (!quiz) {
    notFound();
  }

  const heroUrl = await resolveQuizCardImageUrl(quiz);

  return <QuizEditor quiz={quiz} courses={courses} heroUrl={heroUrl} />;
}

