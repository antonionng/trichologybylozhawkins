"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ContentChannel, ContentSlotStatus } from "@prisma/client";
import { ContentCalendar, type CalendarPost } from "./ContentCalendar";
import { ContentReviewQueue } from "./ContentReviewQueue";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetric } from "@/components/admin/AdminMetric";
import { useToast } from "@/components/admin/Toast";

type PlanOption = { id: string; name: string; timezone: string | null; tags: any | null };

type ContentAutopilotProps = {
  plans: PlanOption[];
  activePlanId: string | null;
  activeMonth: string;
  posts: CalendarPost[];
};

const CHANNEL_OPTIONS: { value: ContentChannel; label: string }[] = [
  { value: ContentChannel.INSTAGRAM, label: "Instagram" },
  { value: ContentChannel.FACEBOOK, label: "Facebook" },
  { value: ContentChannel.LINKEDIN, label: "LinkedIn" },
  { value: ContentChannel.TIKTOK, label: "TikTok" },
  { value: ContentChannel.PINTEREST, label: "Pinterest" },
  { value: ContentChannel.X, label: "X" },
  { value: ContentChannel.YOUTUBE, label: "YouTube" },
  { value: ContentChannel.EMAIL, label: "Email" },
  { value: ContentChannel.BLOG, label: "Blog" },
];

const getLocalTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function ContentAutopilot({ plans, activePlanId, activeMonth, posts }: ContentAutopilotProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [month, setMonth] = useState(activeMonth);
  const [selectedChannels, setSelectedChannels] = useState<Set<ContentChannel>>(
    () => new Set([ContentChannel.INSTAGRAM, ContentChannel.LINKEDIN])
  );
  const [assistantBrief, setAssistantBrief] = useState(
    "Create a premium, science-backed month of trichology content. Keep it educational first, with soft course + consultation CTAs."
  );
  const [themeBlocks, setThemeBlocks] = useState<any[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [batchApproving, setBatchApproving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");

  const timezone = useMemo(getLocalTimezone, []);
  const needsReviewCount = useMemo(() =>
    posts.filter((p) => p.status === ContentSlotStatus.NEEDS_REVIEW).length, [posts]
  );
  const reviewQueueIds = useMemo(() =>
    posts.filter((p) => p.status === ContentSlotStatus.NEEDS_REVIEW)
      .sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""))
      .map((p) => p.id), [posts]
  );

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (channelFilter && p.channel !== channelFilter) return false;
      return true;
    });
  }, [posts, statusFilter, channelFilter]);

  const updateUrl = (nextState: { planId?: string | null; slotId?: string | null }) => {
    const next = new URLSearchParams(searchParams?.toString());
    if (nextState.planId !== undefined) {
      if (nextState.planId) next.set("planId", nextState.planId); else next.delete("planId");
    }
    if (nextState.slotId !== undefined) {
      if (nextState.slotId) next.set("slotId", nextState.slotId); else next.delete("slotId");
    }
    const qs = next.toString();
    router.push(qs ? `/dashboard/content?${qs}` : "/dashboard/content");
  };

  const slotIdFromUrl = searchParams?.get("slotId") ?? null;
  useEffect(() => { if (slotIdFromUrl) setSelectedPostId(slotIdFromUrl); }, [slotIdFromUrl]);

  const handleGenerate = async () => {
    setGenerating(true); setError(null);
    try {
      const response = await fetch("/api/content/autopilot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, timezone, channels: Array.from(selectedChannels), volume: 20, includeImages: true, brief: assistantBrief, themeBlocks: themeBlocks?.length ? themeBlocks : undefined }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(String(payload.error ?? "Failed to generate month"));
      }
      const payload = await response.json();
      toast("Month generated!", "success");
      router.refresh();
      updateUrl({ planId: payload?.plan?.id ?? null, slotId: null });
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected error"); toast("Generation failed", "error"); }
    finally { setGenerating(false); }
  };

  const handleSuggestThemes = async () => {
    setSuggesting(true); setError(null);
    try {
      const response = await fetch(`/api/content/autopilot/suggest?month=${encodeURIComponent(month)}&timezone=${encodeURIComponent(timezone)}`);
      if (!response.ok) { const p = await response.json().catch(() => ({})); throw new Error(p.error ?? "Failed"); }
      const payload = await response.json();
      const suggestions = payload?.suggestions ?? {};
      if (typeof suggestions.brief === "string") setAssistantBrief(suggestions.brief);
      if (Array.isArray(suggestions.themeBlocks)) setThemeBlocks(suggestions.themeBlocks);
      toast("Themes suggested", "success");
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected error"); }
    finally { setSuggesting(false); }
  };

  const handleBatchApprove = async () => {
    if (!activePlanId || needsReviewCount === 0) return;
    setBatchApproving(true); setError(null);
    try {
      const response = await fetch("/api/content/slots/batch-approve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: activePlanId }),
      });
      if (!response.ok) { const p = await response.json().catch(() => ({})); throw new Error(p.error ?? "Failed"); }
      toast("All posts approved", "success"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected error"); }
    finally { setBatchApproving(false); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Content Factory"
        subtitle="Generate the whole month, then approve what's ready"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Content Factory" }]}
        actions={
          <>
            <AdminButton
              href={activePlanId ? `/dashboard/content/new?planId=${encodeURIComponent(activePlanId)}` : "/dashboard/content/new"}
              variant="secondary" size="md"
            >
              + New Post
            </AdminButton>
            <AdminButton variant="primary" size="md" onClick={handleGenerate}
              disabled={generating || selectedChannels.size === 0 || !month} loading={generating}>
              {generating ? "Generating…" : "Generate Month"}
            </AdminButton>
          </>
        }
      />

      {/* Metrics strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label="Total Posts" value={posts.length} />
        <AdminMetric label="Needs Review" value={needsReviewCount}
          trend={needsReviewCount > 0 ? { value: `${needsReviewCount} pending`, positive: false } : undefined} />
        <AdminMetric label="Approved" value={posts.filter((p) => p.status === "APPROVED").length} />
      </div>

      {/* Controls */}
      <Panel variant="default" padding="md" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-admin-text-secondary">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-admin-text-secondary">Channels</label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_OPTIONS.map((option) => {
                const active = selectedChannels.has(option.value);
                return (
                  <button key={option.value} type="button"
                    onClick={() => setSelectedChannels((prev) => { const next = new Set(prev); if (next.has(option.value)) next.delete(option.value); else next.add(option.value); return next; })}
                    className={clsx(
                      "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
                      active ? "border-admin-accent/30 bg-admin-accent/10 text-admin-accent" : "border-admin-border-strong bg-transparent text-admin-text-muted hover:text-admin-text-secondary"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-admin-text-secondary">Saved months</label>
            <select value={activePlanId ?? ""} onChange={(e) => updateUrl({ planId: e.target.value || null, slotId: null })}
              className="w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/40"
            >
              <option value="">Select month…</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-admin-text-secondary">Brief</label>
              <AdminButton variant="ghost" size="sm" onClick={handleSuggestThemes} disabled={suggesting || !month}>
                {suggesting ? "Suggesting…" : "Suggest themes"}
              </AdminButton>
            </div>
            <AdminTextarea value={assistantBrief} onChange={(e) => setAssistantBrief(e.target.value)} rows={4}
              placeholder="Tell the assistant what you want this month to focus on…" />
          </div>

          <Panel variant="elevated" padding="sm" className="space-y-2">
            <p className="text-xs font-medium text-admin-text-secondary">Theme blocks</p>
            {themeBlocks?.length ? (
              <div className="space-y-1.5">
                {themeBlocks.slice(0, 4).map((block: any, idx: number) => (
                  <div key={idx} className="rounded-md border border-admin-border bg-admin-panel p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-admin-text">{block.label ?? `Block ${idx + 1}`}</span>
                      <span className="text-admin-text-muted">Days {block.fromDay ?? "?"}–{block.toDay ?? "?"}</span>
                    </div>
                    <p className="text-admin-text-secondary mt-0.5">{block.theme ?? "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-admin-text-muted">No theme blocks set.</p>
            )}
          </Panel>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-admin-text-muted">AI plans ~20 posts with copy + images.</p>
          <div className="flex items-center gap-2">
            {activePlanId && (
              <AdminButton variant="ghost" size="sm"
                href={`/api/content/export?planId=${activePlanId}&month=${activeMonth}&format=csv`}>
                Download CSV
              </AdminButton>
            )}
            <AdminButton variant="secondary" size="sm" onClick={handleBatchApprove}
              disabled={batchApproving || !activePlanId || needsReviewCount === 0}>
              {batchApproving ? "Approving…" : `Approve all (${needsReviewCount})`}
            </AdminButton>
          </div>
        </div>

        {error && <p className="text-sm text-admin-danger">{error}</p>}
      </Panel>

      {/* Status / channel filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-admin-text-muted mr-1">Filter:</span>
        {["", "NEEDS_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "DRAFT"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx(
              "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
              statusFilter === s ? "border-admin-accent/30 bg-admin-accent/10 text-admin-accent" : "border-admin-border text-admin-text-muted hover:text-admin-text-secondary"
            )}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <Panel variant="default" padding="md">
        <ContentCalendar
          month={activeMonth}
          timezone={timezone}
          posts={filteredPosts}
          onSelectPost={(id) => { setSelectedPostId(id); updateUrl({ slotId: id }); }}
        />
      </Panel>

      {/* Review panel */}
      {selectedPostId && (
        <ContentReviewQueue
          isOpen={Boolean(selectedPostId)}
          slotId={selectedPostId}
          queueIds={reviewQueueIds.length ? reviewQueueIds : [selectedPostId]}
          onClose={() => { setSelectedPostId(null); updateUrl({ slotId: null }); }}
          onNavigate={(id) => { setSelectedPostId(id); updateUrl({ slotId: id }); }}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}
