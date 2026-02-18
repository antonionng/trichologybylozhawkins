"use client";

import { useState } from "react";
import { enrollInVideo } from "@/app/actions/education";

export function VideoEnrollButton({
  videoProductId,
  label = "Enroll — View Video",
  className,
}: {
  videoProductId: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await enrollInVideo(videoProductId);
    } catch (error) {
      console.error(error);
      alert("Failed to enroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading}
      className={
        className ??
        "inline-flex w-full items-center justify-center rounded-xl bg-brand-graphite px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-brand-graphite/85 disabled:opacity-60"
      }
    >
      {loading ? "Enrolling…" : label}
    </button>
  );
}
