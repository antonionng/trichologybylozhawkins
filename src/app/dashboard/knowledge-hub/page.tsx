export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/server/db/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusBadge } from "@/components/admin/AdminBadge";

type ArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  category: string;
  status: string;
  updatedAt: Date;
  source: "entry" | "content-factory";
};

async function getArticles(): Promise<ArticleRow[]> {
  const rows: ArticleRow[] = [];

  const collection = await prisma.collection.findUnique({
    where: { slug: "blog-posts" },
  });

  if (collection) {
    const entries = await prisma.entry.findMany({
      where: { collectionId: collection.id },
      orderBy: { updatedAt: "desc" },
      include: { mediaLinks: { include: { media: true } } },
    });

    for (const e of entries) {
      const meta = (e.meta ?? {}) as Record<string, any>;
      rows.push({
        id: e.id,
        title: e.title,
        summary: e.summary,
        slug: e.slug,
        category: meta.category || "Article",
        status: e.status,
        updatedAt: e.updatedAt,
        source: "entry",
      });
    }
  }

  const slots = await prisma.contentSlot.findMany({
    where: { channel: "BLOG" },
    orderBy: { updatedAt: "desc" },
  });

  for (const s of slots) {
    const meta = (s.metadata ?? {}) as Record<string, any>;
    rows.push({
      id: s.id,
      title: s.title,
      summary: s.brief,
      slug: meta.slug || s.id,
      category: meta.category || "Article",
      status: s.status === "NEEDS_REVIEW" ? "REVIEW" : s.status,
      updatedAt: s.updatedAt,
      source: "content-factory",
    });
  }

  rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return rows;
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function KnowledgeHubList() {
  const articles = await getArticles();

  const published = articles.filter((a) => a.status === "PUBLISHED").length;
  const drafts = articles.filter((a) => a.status === "DRAFT").length;
  const inReview = articles.filter(
    (a) => a.status === "REVIEW" || a.status === "NEEDS_REVIEW",
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Knowledge Hub"
        subtitle="Manage articles, guides, and case studies for the public Knowledge Hub"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Knowledge Hub" },
        ]}
        actions={
          <AdminButton
            href="/dashboard/knowledge-hub/new"
            variant="primary"
            size="md"
          >
            + New Article
          </AdminButton>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-admin-border bg-admin-panel p-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-admin-text-muted">
            Published
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {published}
          </p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-panel p-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-admin-text-muted">
            Drafts
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">
            {drafts}
          </p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-panel p-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-admin-text-muted">
            In Review
          </p>
          <p className="mt-1 text-2xl font-semibold text-blue-400">
            {inReview}
          </p>
        </div>
      </div>

      {/* Articles table */}
      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-admin-border text-left text-[11px] uppercase tracking-wider text-admin-text-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {articles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-admin-text-muted"
                >
                  No articles yet. Create your first article to get started.
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const editHref =
                  article.source === "entry"
                    ? `/dashboard/knowledge-hub/${article.id}`
                    : `/dashboard/content-factory`;
                return (
                  <tr
                    key={article.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={editHref}
                        className="font-medium text-admin-text hover:text-admin-accent transition-colors"
                      >
                        {article.title}
                      </Link>
                      {article.summary && (
                        <p className="mt-0.5 text-xs text-admin-text-muted line-clamp-1">
                          {article.summary}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-admin-text-secondary">
                      {article.category}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          article.source === "entry"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-violet-500/10 text-violet-400"
                        }`}
                      >
                        {article.source === "entry"
                          ? "Knowledge Hub"
                          : "Content Factory"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-admin-text-muted">
                      {fmtDate(article.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AdminButton
                          href={editHref}
                          variant="ghost"
                          size="sm"
                        >
                          Edit
                        </AdminButton>
                        {article.status === "PUBLISHED" && (
                          <AdminButton
                            href={`/blog/${article.slug}`}
                            variant="ghost"
                            size="sm"
                          >
                            View
                          </AdminButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
