"use client";

import Link from "next/link";
import { AdminTable, AdminColumn } from "@/components/admin/AdminTable";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusBadge, AdminBadge } from "@/components/admin/AdminBadge";

type QuizRow = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  status: string;
  isPublic: boolean;
  isFeaturedLead: boolean;
  slug: string | null;
  createdAt: string;
  course: { id: string; title: string; slug: string };
  _count: { questions: number; attempts: number };
};

const columns: AdminColumn<QuizRow>[] = [
  {
    key: "title",
    header: "Quiz",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Link
          href={`/dashboard/education/quizzes/${row.id}`}
          className="text-sm font-medium text-admin-text hover:text-admin-accent transition-colors truncate block"
        >
          {row.title}
        </Link>
        {row.description && (
          <p className="text-xs text-admin-text-muted line-clamp-1 mt-0.5">{row.description}</p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={row.status} />
        {row.isPublic && <AdminBadge variant="accent">Public</AdminBadge>}
        {row.isFeaturedLead && <AdminBadge variant="info">Lead</AdminBadge>}
      </div>
    ),
  },
  {
    key: "course",
    header: "Course",
    render: (row) => <span className="text-sm text-admin-text-secondary">{row.course.title}</span>,
  },
  {
    key: "questions",
    header: "Questions",
    className: "text-right",
    render: (row) => <span className="text-sm text-admin-text-secondary">{row._count.questions}</span>,
  },
  {
    key: "attempts",
    header: "Attempts",
    className: "text-right",
    render: (row) => <span className="text-sm text-admin-text-secondary">{row._count.attempts}</span>,
  },
  {
    key: "pass",
    header: "Pass %",
    className: "text-right",
    render: (row) => <span className="text-sm text-admin-text-secondary">{row.passingScore}%</span>,
  },
];

export function QuizzesTableClient({ quizzes }: { quizzes: QuizRow[] }) {
  return (
    <AdminTable
      columns={columns}
      data={quizzes}
      getRowKey={(r) => r.id}
      renderActions={(row) => {
        const previewHref = row.isPublic && row.slug ? `/quiz/${row.slug}` : `/academy/quizzes/${row.id}`;
        return (
          <div className="flex items-center gap-2">
            <AdminButton href={previewHref} variant="ghost" size="sm">Preview</AdminButton>
            <AdminButton href={`/dashboard/education/quizzes/${row.id}`} variant="ghost" size="sm">Edit</AdminButton>
          </div>
        );
      }}
      emptyMessage="No quizzes yet. Create your first quiz to start assessing students."
    />
  );
}
