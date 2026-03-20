export const dynamic = "force-dynamic";

import { prisma } from "@/server/db/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { QuizzesTableClient } from "./QuizzesTableClient";

async function getQuizzes() {
  return prisma.quiz.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      passingScore: true,
      status: true,
      isPublic: true,
      isFeaturedLead: true,
      slug: true,
      createdAt: true,
      course: { select: { id: true, title: true, slug: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quizzes"
        subtitle="Create and manage course assessments"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Quizzes" },
        ]}
        actions={
          <AdminButton href="/dashboard/education/quizzes/new" variant="primary" size="md">
            + New Quiz
          </AdminButton>
        }
      />
      <QuizzesTableClient quizzes={JSON.parse(JSON.stringify(quizzes))} />
    </div>
  );
}
