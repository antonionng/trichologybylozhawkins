"use client";

import { useEffect, useRef } from "react";
import { recordVideoWatch } from "@/app/actions/education";

export function VideoWatchTracker({
  videoProductId,
}: {
  videoProductId: string;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    recordVideoWatch(videoProductId).catch(() => {});
  }, [videoProductId]);

  return null;
}
