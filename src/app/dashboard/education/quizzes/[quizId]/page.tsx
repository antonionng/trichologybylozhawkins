export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizEditor } from "@/components/dashboard/education/QuizEditor";

interface Props {
  params: { quizId: string };
}

async function getQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      questions: { orderBy: { position: "asc" } },
      _count: { select: { attempts: true } },
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

  return <QuizEditor quiz={quiz} courses={courses} />;
}

