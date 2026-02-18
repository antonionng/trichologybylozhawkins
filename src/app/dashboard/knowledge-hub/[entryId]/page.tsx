export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleEditor } from "@/components/dashboard/knowledge-hub/ArticleEditor";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

type Props = {
  params: Promise<{ entryId: string }>;
};

async function getArticle(entryId: string) {
  return prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      mediaLinks: {
        include: { media: true },
      },
    },
  });
}

export default async function EditArticlePage({ params }: Props) {
  const { entryId } = await params;
  const article = await getArticle(entryId);

  if (!article) {
    notFound();
  }

  const meta = (article.meta ?? {}) as Record<string, any>;
  const content = (article.content ?? { sections: [] }) as {
    sections: any[];
  };

  const heroLink = article.mediaLinks.find((l) => l.fieldKey === "hero");
  let heroMediaUrl = "";
  if (heroLink?.media?.path) {
    try {
      heroMediaUrl = await createSignedDownloadUrl(heroLink.media.path);
    } catch {
      heroMediaUrl = "";
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Article"
        subtitle={article.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Knowledge Hub", href: "/dashboard/knowledge-hub" },
          { label: "Edit" },
        ]}
      />

      <ArticleEditor
        isNew={false}
        initial={{
          id: article.id,
          collectionId: article.collectionId,
          title: article.title,
          slug: article.slug,
          summary: article.summary || "",
          status: article.status as "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED",
          publishedAt: article.publishedAt?.toISOString(),
          meta: {
            category: meta.category || "Article",
            readTime: meta.readTime || "5 min read",
            heroImage: meta.heroImage || "",
          },
          content: {
            sections: content.sections || [],
          },
          heroMediaId: heroLink?.media?.id || "",
          heroMediaUrl,
        }}
      />
    </div>
  );
}
