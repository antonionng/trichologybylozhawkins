export const dynamic = "force-dynamic";

import { getVideoProduct } from "@/app/actions/education";
import { notFound } from "next/navigation";
import { VideoEditor } from "@/components/dashboard/education/VideoEditor";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export default async function VideoEditorPage({ params }: { params: { videoId: string } }) {
  const video = await getVideoProduct(params.videoId);
  if (!video) notFound();

  // Generate a signed URL for the hero image preview in the editor
  const heroUrl = (video as any).heroMedia?.path
    ? await createSignedDownloadUrl((video as any).heroMedia.path)
    : null;

  return <VideoEditor video={video} heroUrl={heroUrl} />;
}
