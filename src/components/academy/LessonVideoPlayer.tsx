"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  title?: string;
  poster?: string;
};

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function LessonVideoPlayer({
  src,
  title,
  poster = "/images/video-placeholder.svg",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasStarted(true);
    void video.play().catch(() => {
      /* user can use native controls */
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-brand-graphite shadow-glass">
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls={hasStarted}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onLoadedMetadata={() => {
            const label = formatDuration(videoRef.current?.duration ?? 0);
            if (label) setDurationLabel(label);
          }}
        />

        {!hasStarted ? (
          <button
            type="button"
            onClick={startPlayback}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 text-white transition hover:bg-black/35"
            aria-label={title ? `Play ${title}` : "Play lesson video"}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
              <svg className="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.14v13.72L19.5 12 8 5.14z" />
              </svg>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              Play lesson
            </span>
            {durationLabel ? (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80">
                {durationLabel}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}
