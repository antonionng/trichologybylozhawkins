export const dynamic = "force-dynamic";

import { getAdminVideos } from "@/app/actions/education";
import { VideoCatalogTable } from "@/components/dashboard/education/VideoCatalogTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { GenerateAllNotesButton } from "@/components/dashboard/education/GenerateAllNotesButton";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export default async function VideoList() {
  const videos = await getAdminVideos();
  const rows = await Promise.all(
    (videos as any[]).map(async (video) => {
      let heroUrl: string | null = null;
      if (video.heroMedia?.path) {
        try { heroUrl = await createSignedDownloadUrl(video.heroMedia.path); } catch { /* use null */ }
      }
      return { ...video, heroUrl };
    })
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Video Library"
        subtitle="Manage on-demand video products and access"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Videos" },
        ]}
        actions={
          <>
            <GenerateAllNotesButton />
            <AdminButton href="/dashboard/education/videos/new" variant="primary" size="md">
              + New Video
            </AdminButton>
          </>
        }
      />
      <VideoCatalogTable videos={rows as any} />
    </div>
  );
}
