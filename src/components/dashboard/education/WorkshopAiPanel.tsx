"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

type WorkshopLike = {
  id: string;
  title?: string | null;
  headline?: string | null;
  summary?: string | null;
  duration?: string | null;
  location?: string | null;
};

export function WorkshopAiPanel({ workshop }: { workshop: WorkshopLike }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const autofill = () => {
    const title = workshop.title?.trim() || "Untitled workshop";
    const headline = workshop.headline?.trim();
    const summary = workshop.summary?.trim();
    setPrompt(
      [
        `Generate full sales page content for this in-person workshop: "${title}".`,
        headline ? `Headline: ${headline}` : null,
        summary ? `Summary: ${summary}` : null,
        workshop.duration ? `Duration: ${workshop.duration}` : null,
        workshop.location ? `Location: ${workshop.location}` : null,
        "Write a persuasive long description, detailed learning outcomes, day-by-day agenda, who it's for, what's included, FAQs, testimonials, and a hero image prompt. Professional tone, targeting salon owners and practitioners.",
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
      const res = await fetch("/api/ai/workshop-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: workshop.id,
          ...(prompt.trim() ? { prompt } : {}),
          image: { aspectRatio: "16:9", style: "natural" },
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        generationId?: string;
        status?: string;
      };
      if (!res.ok || !json.ok || !json.generationId) {
        setError(json.error ?? "Failed to queue AI builder");
        return;
      }
      setGenerationId(json.generationId);
      setStatus(json.status ?? "PENDING");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to queue AI builder"
      );
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
      setError(
        err instanceof Error ? err.message : "Failed to fetch generation"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface variant="card" padding="lg" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          AI workshop builder
        </p>
        <h2 className="text-xl font-semibold text-black">
          Generate workshop content + hero image
        </h2>
        <p className="mt-1 text-sm text-black/60">
          AI will draft the full sales page: headline, description, outcomes,
          agenda, FAQs, testimonials, and a hero image.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.2em] text-black/60">
          Brief (optional — leave blank to generate from workshop details)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={autofill} disabled={busy}>
            Use workshop details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrompt("")}
            disabled={busy}
          >
            Clear brief
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {generationId ? (
        <p className="text-xs text-black/50">
          Generation: <span className="font-mono">{generationId}</span>{" "}
          &middot; Status:{" "}
          <span className="font-semibold text-black">{status ?? "—"}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="md" onClick={run} disabled={busy}>
          {busy ? "Working..." : "Generate with AI"}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={refresh}
          disabled={busy || !generationId}
        >
          Refresh status
        </Button>
      </div>
    </Surface>
  );
}
