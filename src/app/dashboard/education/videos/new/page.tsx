"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upsertVideoProduct } from "@/app/actions/education";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

export default function NewVideoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title first.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const video = await upsertVideoProduct({
        title,
        slug,
        status: "DRAFT",
        videoSourceType: "UPLOAD",
      } as any);

      router.push(`/dashboard/education/videos/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create video");
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <header className="space-y-2">
        <Link
          href="/dashboard/education/videos"
          className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
        >
          ← Back to Videos
        </Link>
        <h1 className="text-4xl font-bold text-black tracking-tight">New Video</h1>
        <p className="text-black/60">Create a new on-demand video product.</p>
      </header>

      <Surface variant="card" padding="lg">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Video Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scalp Diagnostics Essentials"
              className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-xl font-medium focus:border-[#fab826] focus:outline-none focus:ring-4 focus:ring-[#fab826]/10 transition"
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/dashboard/education/videos"
              className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
            >
              Discard
            </Link>
            <Button
              type="submit"
              disabled={isCreating}
              className="min-w-[200px] rounded-2xl bg-[#fab826] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#b67400] shadow-xl shadow-[#fab826]/20 transition active:scale-95"
            >
              {isCreating ? "Creating..." : "Create Video"}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}

