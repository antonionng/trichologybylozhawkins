"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function VideoNotepad({ videoProductId }: { videoProductId: string }) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/academy/videos/${videoProductId}/notes`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setContent(data.content ?? "");
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [videoProductId]);

  const save = useCallback(
    async (text: string) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStatus("saving");
      try {
        const res = await fetch(`/api/academy/videos/${videoProductId}/notes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        setStatus("saved");
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setStatus("error");
      }
    },
    [videoProductId]
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(value), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-graphite/20 border-t-brand-graphite/60" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-brand-graphite/50">
          Your personal notes for this video
        </p>
        <span
          className={`text-[11px] font-medium transition-opacity ${
            status === "idle"
              ? "opacity-0"
              : status === "saving"
                ? "text-brand-graphite/40"
                : status === "saved"
                  ? "text-brand-sage"
                  : "text-red-500"
          }`}
        >
          {status === "saving"
            ? "Saving..."
            : status === "saved"
              ? "Saved"
              : status === "error"
                ? "Save failed"
                : ""}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type your notes here... They save automatically as you type."
        className="flex-1 resize-none rounded-xl border border-brand-graphite/10 bg-white p-4 text-sm leading-relaxed text-brand-graphite placeholder:text-brand-graphite/30 focus:border-brand-sage/40 focus:outline-none focus:ring-2 focus:ring-brand-sage/10"
        style={{ minHeight: "280px" }}
      />
    </div>
  );
}
