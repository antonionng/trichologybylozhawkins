import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { requireVideoAccess } from "@/server/modules/education/access";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { VideoWatchTracker } from "@/components/academy/VideoWatchTracker";
import { VideoRightPanel } from "@/components/academy/VideoRightPanel";

export const dynamic = "force-dynamic";

function toEmbedUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function AcademyVideoPage({
  params,
}: {
  params: { videoId: string };
}) {
  const { user } = await requireUserOrRedirect();
  await requireVideoAccess({ userId: user.id, videoProductId: params.videoId });

  const video = await prisma.videoProduct.findUnique({
    where: { id: params.videoId },
  });

  if (!video) notFound();

  const memberContent = (video.memberContent ?? {}) as Record<string, unknown>;
  const publicContent = (video.publicContent ?? {}) as Record<string, unknown>;
  const takeaways: string[] = Array.isArray(memberContent.keyTakeaways) ? memberContent.keyTakeaways : [];
  const nextSteps: string[] = Array.isArray(memberContent.nextSteps) ? memberContent.nextSteps : [];
  const learningOutcomes: string[] = Array.isArray(publicContent.learningOutcomes) ? publicContent.learningOutcomes : [];
  const benefits: string[] = Array.isArray(publicContent.benefits) ? publicContent.benefits : [];

  const uploadedSignedUrl =
    video.videoSourceType === "UPLOAD" && video.videoPath
      ? await createSignedDownloadUrl(video.videoPath)
      : null;

  const linkUrl = video.videoSourceType === "LINK" ? video.videoUrl : null;
  const embedUrl = linkUrl ? toEmbedUrl(linkUrl) : null;
  const canPlay = Boolean(uploadedSignedUrl || linkUrl);

  const combinedOutcomes = learningOutcomes.length > 0 ? learningOutcomes : benefits;

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
      <VideoWatchTracker videoProductId={video.id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left Column: Video + Info ── */}
        <div className="min-w-0 space-y-5">
          {/* Back link */}
          <Link
            href="/academy"
            className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-graphite/40 transition-colors hover:text-brand-graphite"
          >
            <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Academy
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {video.category && (
                <span className="rounded-full bg-brand-salmon/15 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-salmon">
                  {video.category}
                </span>
              )}
              {video.durationMinutes && (
                <span className="rounded-full bg-brand-graphite/5 px-3 py-0.5 text-[11px] font-medium text-brand-graphite/50">
                  {video.durationMinutes} min
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-graphite sm:text-3xl">
              {video.title}
            </h1>
          </div>

          {/* Video Player */}
          <div className="overflow-hidden rounded-2xl bg-brand-graphite shadow-glass">
            {!canPlay ? (
              <div className="flex aspect-video items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                  </svg>
                  <p className="mt-3 text-sm text-white/40">Video coming soon</p>
                </div>
              </div>
            ) : uploadedSignedUrl ? (
              <video
                controls
                className="aspect-video w-full bg-black object-contain"
                src={uploadedSignedUrl}
              />
            ) : embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              </div>
            ) : (
              <video
                controls
                className="aspect-video w-full bg-black object-contain"
                src={linkUrl ?? undefined}
              />
            )}
          </div>

          {/* Description below video */}
          {(video.subtitle || video.description) && (
            <div className="rounded-xl border border-brand-graphite/6 bg-white p-5">
              {video.subtitle && (
                <p className="text-sm font-medium text-brand-graphite">
                  {video.subtitle}
                </p>
              )}
              {video.description && video.description !== video.subtitle && (
                <p className={`text-sm leading-relaxed text-brand-graphite/60 ${video.subtitle ? "mt-2" : ""}`}>
                  {video.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: Notes & Overview Panel ── */}
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
          <VideoRightPanel
            videoProductId={video.id}
            learningOutcomes={combinedOutcomes}
            takeaways={takeaways}
            nextSteps={nextSteps}
          />
        </div>
      </div>
    </div>
  );
}
