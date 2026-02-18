"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { upsertCourse } from "@/app/actions/education";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import Link from "next/link";
import clsx from "clsx";

const PROGRESS_STAGES = [
  { key: "analysing_brief", label: "Analysing your brief" },
  { key: "designing_curriculum", label: "Designing curriculum" },
  { key: "structuring_modules", label: "Structuring modules" },
  { key: "building_lessons", label: "Building lessons" },
  { key: "generating_image", label: "Generating hero image" },
] as const;

type ProgressStageKey = (typeof PROGRESS_STAGES)[number]["key"];

function stageIndex(stage: string | undefined): number {
  if (!stage) return -1;
  const i = PROGRESS_STAGES.findIndex((s) => s.key === stage);
  return i >= 0 ? i : -1;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [brief, setBrief] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  const [progressView, setProgressView] = useState(false);
  const [progressCourseId, setProgressCourseId] = useState<string | null>(null);
  const [progressGenerationId, setProgressGenerationId] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<string | undefined>(undefined);
  const [progressDetail, setProgressDetail] = useState<string | undefined>(undefined);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      const course = await upsertCourse({
        title,
        slug,
        status: "DRAFT",
        enrollmentType: "ON_DEMAND",
      } as any);

      if (mode === "ai") {
        const res = await fetch("/api/ai/course-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            ...(brief.trim() ? { prompt: brief } : {}),
            replaceExisting: true,
            image: { aspectRatio: "1:1", style: "natural" },
          }),
        });

        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          error?: string;
          generationId?: string;
          status?: string;
        };

        if (!res.ok || !data?.ok || !data.generationId) {
          setError(data?.error ?? `AI generation failed (${res.status})`);
          setIsCreating(false);
          return;
        }

        setProgressCourseId(course.id);
        setProgressGenerationId(data.generationId);
        setProgressStatus(data.status ?? "PROCESSING");
        setProgressStage(undefined);
        setProgressDetail(undefined);
        setProgressError(null);
        setProgressView(true);
        setIsCreating(false);
        return;
      }

      router.push(`/dashboard/education/courses/${course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!progressGenerationId || !progressView) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/ai/generations/${progressGenerationId}`);
        const data = (await res.json()) as {
          status?: string;
          error?: string;
          output?: { progress?: { stage?: string; detail?: string } };
        };
        if (!res.ok) return;

        setProgressStatus(data.status ?? "PROCESSING");
        setProgressError(data.error ?? null);
        const progress = data.output?.progress;
        if (progress) {
          setProgressStage(progress.stage);
          setProgressDetail(progress.detail);
        }

        if (data.status === "COMPLETED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setRedirecting(true);
          setTimeout(() => {
            router.push(`/dashboard/education/courses/${progressCourseId ?? ""}#ai`);
          }, 1200);
        }

        if (data.status === "FAILED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch {
        // ignore network errors; will retry next poll
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [progressGenerationId, progressView, progressCourseId, router]);

  const rawStageIndex = stageIndex(progressStage);
  const currentStageIndex =
    (progressStatus === "PROCESSING" || progressStatus === "PENDING") && rawStageIndex < 0
      ? 0
      : rawStageIndex;
  const isComplete = progressStatus === "COMPLETED";
  const isFailed = progressStatus === "FAILED";

  if (progressView && progressCourseId && progressGenerationId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-24">
        <AdminPageHeader
          title="New Program"
          subtitle="Your trichology AI course writer is at work."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Education", href: "/dashboard/education" },
            { label: "Courses", href: "/dashboard/education/courses" },
            { label: "New" },
          ]}
        />

        <div className="rounded-xl border border-admin-border bg-admin-elevated p-7 sm:p-9">
          {redirecting ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 rounded-full bg-admin-success/20 flex items-center justify-center">
                <svg className="h-6 w-6 text-admin-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-admin-text">Program ready</p>
              <p className="text-sm text-admin-text-muted">Taking you to the editor...</p>
            </div>
          ) : isFailed ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-admin-danger/10 border border-admin-danger/20 p-4 text-sm text-admin-danger font-medium">
                {progressError ?? "Generation failed."}
              </div>
              <div className="flex gap-3">
                <AdminButton
                  variant="primary"
                  onClick={() => {
                    setProgressView(false);
                    setProgressGenerationId(null);
                    setProgressCourseId(null);
                    setProgressStatus(null);
                    setProgressError(null);
                  }}
                >
                  Back to form
                </AdminButton>
                <AdminButton href={`/dashboard/education/courses/${progressCourseId}`} variant="secondary">
                  Open course anyway
                </AdminButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-admin-text-secondary">
                Watch the AI build your course step by step. You&apos;ll be redirected when it&apos;s done.
              </p>
              <ul className="space-y-0">
                {PROGRESS_STAGES.map((step, i) => {
                  const isDone = isComplete || currentStageIndex > i;
                  const isCurrent = !isComplete && currentStageIndex === i;
                  return (
                    <li key={step.key} className="flex gap-4">
                      <div
                        className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition",
                          isDone && !isCurrent && "border-admin-success bg-admin-success/20",
                          isCurrent && "border-admin-accent bg-admin-accent/20",
                          !isDone && !isCurrent && "border-admin-border bg-admin-panel"
                        )}
                      >
                        {isDone && !isCurrent ? (
                          <svg className="h-4 w-4 text-admin-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="h-2 w-2 animate-pulse rounded-full bg-admin-accent" />
                        ) : (
                          <span className="text-xs font-medium text-admin-text-muted">{i + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-6">
                        <p
                          className={clsx(
                            "font-medium",
                            isDone && !isCurrent && "text-admin-text",
                            isCurrent && "text-admin-text",
                            !isDone && !isCurrent && "text-admin-text-muted"
                          )}
                        >
                          {step.label}
                        </p>
                        {isCurrent && progressDetail && (
                          <p className="mt-0.5 text-sm text-admin-text-muted">{progressDetail}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <AdminPageHeader
        title="New Program"
        subtitle="Launch a new education product. Start with AI for speed, or build manually."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Courses", href: "/dashboard/education/courses" },
          { label: "New" },
        ]}
      />

      <nav className="flex gap-1 rounded-lg bg-admin-panel border border-admin-border p-1">
        <button
          onClick={() => setMode("ai")}
          className={clsx(
            "flex-1 rounded-md py-2.5 text-xs font-semibold uppercase tracking-widest transition",
            mode === "ai"
              ? "bg-admin-accent text-black"
              : "text-admin-text-muted hover:text-admin-text-secondary hover:bg-white/5"
          )}
        >
          Generate with AI
        </button>
        <button
          onClick={() => setMode("manual")}
          className={clsx(
            "flex-1 rounded-md py-2.5 text-xs font-semibold uppercase tracking-widest transition",
            mode === "manual"
              ? "bg-admin-accent text-black"
              : "text-admin-text-muted hover:text-admin-text-secondary hover:bg-white/5"
          )}
        >
          Manual Setup
        </button>
      </nav>

      <div className="rounded-xl border border-admin-border bg-admin-elevated p-7 sm:p-9">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-admin-text-muted">
              Program Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Trichology & Scalp Care"
              className="w-full rounded-lg border border-admin-border-strong bg-admin-panel px-4 py-3 text-lg font-medium text-admin-text placeholder:text-admin-text-muted/60 focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/20 transition"
              autoFocus
            />
          </div>

          {mode === "ai" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-admin-text-muted">
                Course Brief (Describe your vision)
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Example: A 6-module masterclass for salon owners. Cover hair biology, common scalp conditions, and how to sell clinical services. Professional but approachable tone."
                rows={6}
                className="w-full rounded-lg border border-admin-border-strong bg-admin-panel px-4 py-3 text-sm text-admin-text placeholder:text-admin-text-muted/60 focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/20 transition"
              />
              <p className="text-[11px] text-admin-text-muted leading-relaxed italic">
                Our AI will draft complete written theory for every lesson, plus modules, learning outcomes, sales copy, and a luxury clinical hero image.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-admin-danger/10 border border-admin-danger/20 p-4 text-sm text-admin-danger font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard/education/courses"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-admin-text-muted hover:text-admin-text-secondary transition"
            >
              Discard
            </Link>
            <AdminButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isCreating}
            >
              {isCreating ? "Preparing Program..." : mode === "ai" ? "Generate Program" : "Create Manual Shell"}
            </AdminButton>
          </div>
        </form>
      </div>

      {mode === "ai" && (
        <div className="rounded-xl border border-admin-accent/20 bg-admin-accent/5 p-6 flex gap-5 items-start">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-admin-accent flex items-center justify-center text-lg text-black">
            &#x2728;
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-admin-text">How AI generation works</h3>
            <p className="text-sm text-admin-text-secondary leading-relaxed">
              Once you click generate, we&apos;ll create the program shell and start drafting in the background.
              The AI writes complete, in-depth theory for every lesson — ready-to-read educational content
              your students can learn from immediately, no video required. You&apos;ll be redirected to the editor
              where you can refine the results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
