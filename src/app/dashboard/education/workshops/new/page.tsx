"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upsertWorkshop } from "@/app/actions/education";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export async function assertSuccessfulAiWorkshopBuild(response: Response) {
  if (response.ok) {
    return;
  }

  let message = `Failed to generate workshop draft (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body?.error === "string" && body.error.trim()) {
      message = body.error;
    }
  } catch {
    // Keep the default fallback when the response is not valid JSON.
  }

  throw new Error(message);
}

export default function NewWorkshopPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a workshop title first.");
      return;
    }

    setIsCreating(true);
    setError(null);
    let createdWorkshopId: string | null = null;

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const workshop = await upsertWorkshop({
        title,
        slug,
        status: "DRAFT",
      } as any);
      createdWorkshopId = workshop.id;

      if (mode === "ai") {
        const response = await fetch("/api/ai/workshop-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workshopId: workshop.id,
            prompt: brief.trim() || undefined,
            image: { aspectRatio: "16:9", style: "natural" },
          }),
        });
        await assertSuccessfulAiWorkshopBuild(response);
      }

      router.push(`/dashboard/education/workshops/${workshop.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create workshop";
      if (createdWorkshopId && mode === "ai") {
        router.push(
          `/dashboard/education/workshops/${createdWorkshopId}?generationError=${encodeURIComponent(message)}`,
        );
        router.refresh();
        return;
      }
      setError(message);
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <header className="space-y-2">
        <Link
          href="/dashboard/education/workshops"
          className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
        >
          &larr; Back to Workshops
        </Link>
        <h1 className="text-4xl font-bold text-black tracking-tight">
          New Workshop
        </h1>
        <p className="text-black/60">
          Create an in-person training workshop. Start with AI for speed, or
          build manually.
        </p>
      </header>

      <nav className="flex gap-1 rounded-2xl bg-black/5 p-1">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition ${
            mode === "ai"
              ? "bg-white text-black shadow-sm"
              : "text-black/40 hover:text-black"
          }`}
        >
          Generate with AI
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition ${
            mode === "manual"
              ? "bg-white text-black shadow-sm"
              : "text-black/40 hover:text-black"
          }`}
        >
          Manual Setup
        </button>
      </nav>

      <Surface variant="card" padding="lg">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Workshop Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Scalp Analysis Workshop"
              className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-xl font-medium focus:border-[#fab826] focus:outline-none focus:ring-4 focus:ring-[#fab826]/10 transition"
              autoFocus
            />
          </div>

          {mode === "ai" && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                Workshop Brief (Describe your vision)
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Example: A one-day hands-on workshop for salon teams covering scalp assessment, treatment techniques, and client consultation skills. Aimed at stylists who want to add scalp care as a premium service."
                rows={8}
                className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm focus:border-[#fab826] focus:outline-none focus:ring-4 focus:ring-[#fab826]/10 transition"
              />
              <p className="text-[11px] text-black/40 leading-relaxed italic">
                Our AI will generate a full workshop page with headline,
                description, agenda, outcomes, FAQs, testimonials, and a hero
                image.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/dashboard/education/workshops"
              className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
            >
              Discard
            </Link>
            <Button
              type="submit"
              disabled={isCreating}
              className="min-w-[200px] rounded-2xl bg-[#fab826] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#b67400] shadow-xl shadow-[#fab826]/20 transition active:scale-95"
            >
              {isCreating
                ? "Creating Workshop..."
                : mode === "ai"
                  ? "Generate Workshop"
                  : "Create Workshop"}
            </Button>
          </div>
        </form>
      </Surface>

      {mode === "ai" && (
        <div className="rounded-3xl border border-[#fab826]/20 bg-[#fab826]/5 p-8 flex gap-6 items-start">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#fab826] flex items-center justify-center text-xl shadow-lg">
            &#10024;
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-black">How AI generation works</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Once you click generate, we&apos;ll create the workshop shell and
              draft all the sales content in the background. You&apos;ll be
              redirected to the editor where you can refine headline, outcomes,
              agenda, FAQs, testimonials, and imagery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
