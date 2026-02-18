"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

type CourseLike = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  enrollmentType?: string | null;
};

export function CourseAiPanel({ course }: { course: CourseLike }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const courseId = course.id;

  const autofill = () => {
    const title = course.title?.trim() || "Untitled course";
    const subtitle = course.subtitle?.trim();
    const description = course.description?.trim();
    setPrompt(
      [
        `Build the curriculum for this course: "${title}".`,
        subtitle ? `Subtitle: ${subtitle}` : null,
        description ? `Description: ${description}` : null,
        "Create a clear module progression with in-depth written theory for every lesson. Include learning outcomes, requirements, target audience, FAQs, and a luxury clinical hero image prompt.",
      ]
        .filter(Boolean)
        .join("\n")
    );
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/course-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          // Prompt is optional; if empty, the API will generate based on course details.
          ...(prompt.trim() ? { prompt } : {}),
          replaceExisting,
          image: { aspectRatio: "1:1", style: "natural" },
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; generationId?: string; status?: string };
      if (!res.ok || !json.ok || !json.generationId) {
        setError(json.error ?? "Failed to queue AI builder");
        return;
      }
      setGenerationId(json.generationId);
      setStatus(json.status ?? "PENDING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to queue AI builder");
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    if (!generationId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/generations/${generationId}`);
      const json = (await res.json()) as any;
      if (!res.ok) {
        setError(json?.error ?? "Failed to fetch generation");
        return;
      }
      const next = (json?.status ?? "UNKNOWN") as string;
      setStatus(next);
      if (next === "COMPLETED") {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch generation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface variant="card" padding="lg" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">AI course builder</p>
        <h2 className="text-xl font-semibold text-black">Generate full course with written theory</h2>
        <p className="mt-1 text-sm text-black/60">
          AI will write complete modules, lessons with in-depth theory content, sales copy, and a hero image.
          Every lesson gets detailed, ready-to-read educational material.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.2em] text-black/60">
          Brief (optional — leave blank to generate from course details)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={autofill} disabled={busy}>
            Use course title/description
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPrompt("")} disabled={busy}>
            Clear brief
          </Button>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-black/70">
        <input
          type="checkbox"
          checked={replaceExisting}
          onChange={(e) => setReplaceExisting(e.target.checked)}
        />
        Replace existing modules/lessons
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {generationId ? (
        <p className="text-xs text-black/50">
          Generation: <span className="font-mono">{generationId}</span> · Status:{" "}
          <span className="font-semibold text-black">{status ?? "—"}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="md" onClick={run} disabled={busy}>
          {busy ? "Working..." : "Generate with AI"}
        </Button>
        <Button variant="ghost" size="md" onClick={refresh} disabled={busy || !generationId}>
          Refresh status
        </Button>
      </div>
    </Surface>
  );
}



