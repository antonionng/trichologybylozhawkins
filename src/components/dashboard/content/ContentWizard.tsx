"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/ui/Tooltip";
import clsx from "clsx";

type PlanOption = {
  id: string;
  name: string;
};

type ContentWizardProps = {
  planOptions?: PlanOption[];
  /** "single" = minimal UI for creating one post. "full" = power-user wizard. */
  variant?: "single" | "full";
  /** Optional default plan to attach the slot to (kept hidden in single variant). */
  defaultPlanId?: string;
  onCancel?: () => void;
  onSuccess?: (result: { slotId: string; planId?: string }) => void;
  redirectToCalendarOnSuccess?: boolean;
};

const CHANNEL_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "PINTEREST", label: "Pinterest" },
  { value: "X", label: "X / Twitter" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "EMAIL", label: "Email" },
];

const SUGGESTED_TONES = ["Professional", "Warm", "Scientific", "Urgent", "Casual"];

export function ContentWizard({
  planOptions,
  variant = "full",
  defaultPlanId,
  onCancel,
  onSuccess,
  redirectToCalendarOnSuccess = false,
}: ContentWizardProps) {
  const router = useRouter();
  const plans = planOptions ?? [];
  const resolvedDefaultPlanId =
    (defaultPlanId && plans.some((p) => p.id === defaultPlanId) ? defaultPlanId : undefined) ??
    plans[0]?.id ??
    "";
  const [planId, setPlanId] = useState(resolvedDefaultPlanId);
  const [title, setTitle] = useState("Seasonal scalp revival series");
  const [persona, setPersona] = useState("Studio owners craving scientific scalp rituals");
  const [campaign, setCampaign] = useState("Autumn Detox Sprint");
  const [channels, setChannels] = useState<Set<string>>(
    () => new Set(["INSTAGRAM", "LINKEDIN"])
  );
  const [singleChannel, setSingleChannel] = useState("INSTAGRAM");
  const [tone, setTone] = useState("warm, scientific, energetic");
  const [goals, setGoals] = useState("Spark consultations\nDrive preorder interest");
  const [scheduledFor, setScheduledFor] = useState("");
  const [prompt, setPrompt] = useState(
    "Outline a premium carousel + caption that teases Lorraine's scalp detox intensive."
  );
  const [includeImages, setIncludeImages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [creationMode, setCreationMode] = useState<"freeform" | "template" | "manual">(
    variant === "single" ? "freeform" : "freeform"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedChannels = useMemo(() => Array.from(channels), [channels]);

  const toggleChannel = (value: string) => {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const effectiveChannels = variant === "single" ? [singleChannel] : selectedChannels;
      const effectiveTitle =
        title.trim() ||
        prompt
          .trim()
          .split(/\s+/g)
          .slice(0, 7)
          .join(" ")
          .slice(0, 80) ||
        "New post";

      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planId || undefined,
          title: effectiveTitle,
          persona: variant === "single" && !showAdvanced ? "General audience" : persona,
          campaign: variant === "single" && !showAdvanced ? "Single post" : campaign,
          channels: effectiveChannels,
          tone:
            variant === "single" && !showAdvanced
              ? ["warm", "expert", "premium"]
              : tone
                  .split(",")
                  .map((token) => token.trim())
                  .filter(Boolean),
          goals:
            variant === "single" && !showAdvanced
              ? ["consultations", "education sales"]
              : goals
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
          includeImages,
          prompt: creationMode === "manual" ? "MANUAL_ENTRY" : prompt, // Handle manual mode differently in backend if needed, or just treat as dummy prompt
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
          mode: creationMode,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? "Failed to queue generation");
      }

      const payload = await response.json().catch(() => ({} as any));
      const slotId = payload?.slot?.id as string | undefined;
      const createdPlanId = payload?.slot?.planId as string | undefined;

      setMessage("Queued. The slot will populate once AI draft completes.");
      setTitle("");
      setPrompt("");
      router.refresh();
      if (slotId) {
        onSuccess?.({ slotId, planId: createdPlanId });
      }

      // Optional redirect for “single post” flow: drop user straight into the review modal on the calendar page.
      if (redirectToCalendarOnSuccess && slotId) {
        const params = new URLSearchParams();
        if (createdPlanId) params.set("planId", createdPlanId);
        params.set("slotId", slotId);
        router.push(`/dashboard/content?${params.toString()}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm text-black/70">
      {variant === "full" ? (
        <div className="flex gap-2 p-1 bg-black/5 rounded-lg mb-6">
         <button
           type="button"
           onClick={() => setCreationMode("freeform")}
           className={clsx(
             "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
             creationMode === "freeform" ? "bg-white shadow text-black" : "text-black/40 hover:text-black/60"
           )}
         >
           Freeform AI
         </button>
         <button
            type="button"
            onClick={() => setCreationMode("template")}
            className={clsx(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
              creationMode === "template" ? "bg-white shadow text-black" : "text-black/40 hover:text-black/60"
            )}
          >
            From Template
          </button>
          <button
            type="button"
            onClick={() => setCreationMode("manual")}
            className={clsx(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
              creationMode === "manual" ? "bg-white shadow text-black" : "text-black/40 hover:text-black/60"
            )}
          >
            Manual / CMS
          </button>
        </div>
      ) : null}

      <p className="text-sm text-black/60">
        {variant === "single"
          ? "Describe the post you want. We'll generate caption + optional image, then open it for approval."
          : creationMode === "freeform"
            ? "Fill out this form to queue a new content piece. Our AI will generate a brief and assets based on your choices."
            : creationMode === "template"
              ? "Select a proven recipe to quickly generate content with Lorraine's voice."
              : "Manually schedule a post or link an existing CMS entry without generating new copy."}
      </p>

      <div className="space-y-6">
        {/* Section 1: Strategy & Targeting */}
        {variant === "full" ? (
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-black/40">
            1. Strategy & Targeting
          </h3>
          
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Plan</span>
                  <Tooltip content="e.g. Q1 Growth Strategy">
                    <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                  </Tooltip>
                </div>
                <p className="text-[10px] leading-tight text-black/40">Choose which high-level plan this belongs to.</p>
                <select
                  value={planId}
                  onChange={(event) => setPlanId(event.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                >
                  <option value="">Unassigned</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Campaign</span>
                  <Tooltip content="e.g. Summer Scalp Protection">
                    <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                  </Tooltip>
                </div>
                <p className="text-[10px] leading-tight text-black/40">
                  The broader campaign theme (e.g. &quot;Summer Launch&quot;).
                </p>
                <input
                  value={campaign}
                  onChange={(event) => setCampaign(event.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                  placeholder="Launch, nurture, seasonal push"
                />
              </label>
            </div>

            <label className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Persona</span>
                <Tooltip content="e.g. Busy moms with hair loss concerns">
                  <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                </Tooltip>
              </div>
              <p className="text-[10px] leading-tight text-black/40">Who is this content targeting specifically?</p>
              <input
                value={persona}
                onChange={(event) => setPersona(event.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                placeholder="Salon leaders, academy trainees, etc."
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Goals</span>
                <Tooltip content="e.g. Increase newsletter signups by 10%">
                  <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                </Tooltip>
              </div>
              <p className="text-[10px] leading-tight text-black/40">What should this content achieve?</p>
              <textarea
                value={goals}
                onChange={(event) => setGoals(event.target.value)}
                className="min-h-[80px] w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                placeholder="One goal per line"
              />
            </label>
          </div>
          </div>
        ) : null}

        {/* Section 2: Content Details */}
        <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-black/40">
            {variant === "single" ? "1. Post details" : "2. Content Details"}
          </h3>

          <div className="space-y-5">
            <label className="space-y-1.5 block">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Slot title</span>
                <Tooltip content="e.g. 5 Tips for Scalp Health Carousel">
                  <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                </Tooltip>
              </div>
              <p className="text-[10px] leading-tight text-black/40">Internal name for this content slot.</p>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                placeholder={variant === "single" ? "Optional (we’ll auto-name it)" : "Tease the Detox Intensive"}
              />
            </label>

            {variant === "full" && creationMode !== "manual" && (
              <label className="space-y-1.5 block">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Tone</span>
                  <Tooltip content="e.g. Clinical, Empathetic, Authoritative">
                    <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                  </Tooltip>
                </div>
                <p className="text-[10px] leading-tight text-black/40">Describe the voice tone.</p>
                <div className="space-y-2">
                  <input
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                    placeholder="confident, nurturing, luxurious"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone((prev) => (prev ? `${prev}, ${t}` : t))}
                        className="rounded-full border border-black/5 bg-white px-2.5 py-1 text-[10px] font-medium text-black/60 transition hover:border-[#fab826] hover:text-[#bf7c00]"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              </label>
            )}

            {variant === "single" ? (
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Channel</span>
                <p className="text-[10px] leading-tight text-black/40">Pick the primary platform.</p>
                <select
                  value={singleChannel}
                  onChange={(e) => setSingleChannel(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                >
                  {CHANNEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Channels</span>
              <p className="mb-2 text-[10px] leading-tight text-black/40">Select all platforms where this will be posted.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((option) => {
                  const active = channels.has(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleChannel(option.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
                        active
                          ? "border-[#fab826] bg-[#fab826] text-white shadow-sm"
                          : "border-black/10 bg-white text-black/50 hover:border-black/20 hover:bg-black/[0.01]"
                      }`}
                    >
                      {/* Simple dot indicator */}
                      <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-black/20"}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              </div>
            )}

            <label className="space-y-1.5 block">
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Schedule</span>
              <p className="text-[10px] leading-tight text-black/40">When should this go live?</p>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              />
            </label>

            {variant === "single" ? (
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:border-black/20"
              >
                {showAdvanced ? "Hide advanced" : "Advanced options"}
              </button>
            ) : null}

            {variant === "single" && showAdvanced ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Persona</span>
                  <input
                    value={persona}
                    onChange={(event) => setPersona(event.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                    placeholder="Who is this for?"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Campaign</span>
                  <input
                    value={campaign}
                    onChange={(event) => setCampaign(event.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                    placeholder="Optional"
                  />
                </label>
                <label className="space-y-1.5 block sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Goals</span>
                  <textarea
                    value={goals}
                    onChange={(event) => setGoals(event.target.value)}
                    className="min-h-[70px] w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                    placeholder="One per line"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section 3: The Brief */}
        {creationMode !== "manual" && (
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-black/40">
              {variant === "single" ? "2. Brief" : "3. The Brief"}
            </h3>

            <label className="space-y-1.5 block">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">Prompt</span>
                <Tooltip content="e.g. Write a 3-part carousel about biotin supplements, focusing on scientific evidence.">
                  <div className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-black/20 text-[9px] font-bold text-black/50 transition hover:border-[#fab826] hover:text-[#fab826]">?</div>
                </Tooltip>
              </div>
              <p className="text-[10px] leading-tight text-black/40">Give the AI detailed instructions on what to create.</p>
              <textarea
                required
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm transition focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                placeholder="Explain what the AI should produce"
              />
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-lg border border-black/5 bg-white p-3">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(event) => setIncludeImages(event.target.checked)}
                className="h-4 w-4 rounded border border-black/30 accent-[#fab826]"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                Render hero images for this slot
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="pt-2 flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-full border border-black/10 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black/60 transition hover:bg-black/5 active:translate-y-[1px]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || (variant === "single" ? !singleChannel : selectedChannels.length === 0)}
          className="w-full rounded-full bg-[#fab826] px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#7d4e00] shadow-lg shadow-[#fab826]/20 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#fab826]/30 active:translate-y-[1px] active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Queueing..."
            : variant === "single"
              ? "Generate post"
              : creationMode === "manual"
                ? "Create Slot"
                : "Generate brief"}
        </button>
      </div>
      {message ? <p className="mt-3 text-center text-xs text-black/60">{message}</p> : null}
    </form>
  );
}
