export const dynamic = "force-dynamic";

import { prisma } from "@/server/db/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleEditor } from "@/components/dashboard/knowledge-hub/ArticleEditor";

async function getOrCreateBlogCollection() {
  let collection = await prisma.collection.findUnique({
    where: { slug: "blog-posts" },
  });

  if (!collection) {
    collection = await prisma.collection.create({
      data: {
        name: "Blog Posts",
        slug: "blog-posts",
        description: "Knowledge Hub articles, guides, and case studies",
        type: "DOCUMENT",
      },
    });
  }

  return collection;
}

export default async function NewArticlePage() {
  const collection = await getOrCreateBlogCollection();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Article"
        subtitle="Create a new Knowledge Hub article"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Knowledge Hub", href: "/dashboard/knowledge-hub" },
          { label: "New Article" },
        ]}
      />

      <ArticleEditor
        isNew
        initial={{
          collectionId: collection.id,
          title: "",
          slug: "",
          summary: "",
          status: "DRAFT",
          meta: {
            category: "Hair Loss",
            readTime: "5 min read",
          },
          content: {
            sections: [
              { type: "paragraph", text: "" },
            ],
          },
        }}
      />
    </div>
  );
}
