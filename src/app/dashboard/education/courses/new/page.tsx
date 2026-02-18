"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upsertCourse } from "@/app/actions/education";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [brief, setBrief] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a course title first.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Create the course shell first
      const course = await upsertCourse({
        title,
        slug,
        status: "DRAFT",
        enrollmentType: "ON_DEMAND",
      } as any);

      if (mode === "ai") {
        // Trigger AI build in the background. If no brief is provided, the API will generate based on course details.
        await fetch("/api/ai/course-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            ...(brief.trim() ? { prompt: brief } : {}),
            replaceExisting: true,
            image: { aspectRatio: "1:1", style: "natural" },
          }),
        });
      }

      router.push(`/dashboard/education/courses/${course.id}#ai`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <header className="space-y-2">
        <Link
          href="/dashboard/education/courses"
          className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
        >
          ← Back to Catalog
        </Link>
        <h1 className="text-4xl font-bold text-black tracking-tight">New Program</h1>
        <p className="text-black/60">Launch a new education product. Start with AI for speed, or build manually.</p>
      </header>

      <nav className="flex gap-1 rounded-2xl bg-black/5 p-1">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition ${
            mode === "ai" ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black"
          }`}
        >
          Generate with AI
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition ${
            mode === "manual" ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black"
          }`}
        >
          Manual Setup
        </button>
      </nav>

      <Surface variant="card" padding="lg">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Program Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Trichology & Scalp Care"
              className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-xl font-medium focus:border-[#fab826] focus:outline-none focus:ring-4 focus:ring-[#fab826]/10 transition"
              autoFocus
            />
          </div>

          {mode === "ai" && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                Course Brief (Describe your vision)
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Example: A 6-module masterclass for salon owners. Cover hair biology, common scalp conditions, and how to sell clinical services. Professional but approachable tone."
                rows={8}
                className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm focus:border-[#fab826] focus:outline-none focus:ring-4 focus:ring-[#fab826]/10 transition"
              />
              <p className="text-[11px] text-black/40 leading-relaxed italic">
                Our AI will draft complete written theory for every lesson, plus modules, learning outcomes, sales copy, and a luxury clinical hero image.
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
              href="/dashboard/education/courses"
              className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition"
            >
              Discard
            </Link>
            <Button
              type="submit"
              disabled={isCreating}
              className="min-w-[200px] rounded-2xl bg-[#fab826] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#b67400] shadow-xl shadow-[#fab826]/20 transition active:scale-95"
            >
              {isCreating ? "Preparing Program..." : mode === "ai" ? "Generate Program" : "Create Manual Shell"}
            </Button>
          </div>
        </form>
      </Surface>

      {mode === "ai" && (
        <div className="rounded-3xl border border-[#fab826]/20 bg-[#fab826]/5 p-8 flex gap-6 items-start">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#fab826] flex items-center justify-center text-xl shadow-lg">✨</div>
          <div className="space-y-2">
            <h3 className="font-bold text-black">How AI generation works</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Once you click generate, we'll create the program shell and start drafting in the background.
              The AI writes complete, in-depth theory for every lesson — ready-to-read educational content
              your students can learn from immediately, no video required. You'll be redirected to the editor
              where you can refine the results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}






