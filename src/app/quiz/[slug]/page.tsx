export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizTaker } from "@/components/education/QuizTaker";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";

interface Props {
  params: { slug: string };
}

async function getPublicQuiz(slug: string) {
  return prisma.quiz.findUnique({
    where: { slug },
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

export default async function PublicQuizPage({ params }: Props) {
  let quiz = await getPublicQuiz(params.slug);

  // If the DB is fresh and seeding hasn't been run, bootstrap the featured public quiz on-demand.
  if (!quiz) {
    const attempted = await ensureFeaturedPublicQuizExists(params.slug);
    if (attempted) {
      quiz = await getPublicQuiz(params.slug);
    }
  }

  if (!quiz || !quiz.isPublic || quiz.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fff9ed] py-12">
      <div className="mx-auto max-w-3xl px-6">
        <QuizTaker
          quiz={quiz as any}
          submitUrl={`/api/public/quiz/${encodeURIComponent(params.slug)}/submit`}
          mode="public_lead_gate"
          resultPrimaryCta={{ href: "/contact", label: "Book consultation" }}
          resultSecondaryCta={{ href: "/education", label: "Explore academy" }}
        />
      </div>
    </main>
  );
}

