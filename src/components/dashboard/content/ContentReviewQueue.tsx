"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AssetVariantStatus, ContentAssetType, ContentSlotStatus } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";

type SlotAssetVariant = {
  id: string;
  platform: string;
  status: AssetVariantStatus;
  headline: string | null;
  copy: string | null;
  cta: string | null;
  hashtags: string | null;
};

type SlotAsset = {
  id: string;
  type: ContentAssetType;
  title: string | null;
  summary: string | null;
  mediaUrl: string | null;
  variants: SlotAssetVariant[];
};

type SlotDetail = {
  id: string;
  title: string;
  brief: string | null;
  persona: string | null;
  campaign: string | null;
  channel: string;
  status: ContentSlotStatus;
  scheduledFor: string | null;
  assets: SlotAsset[];
};

type ContentReviewQueueProps = {
  isOpen: boolean;
  slotId: string;
  queueIds: string[];
  onClose: () => void;
  onNavigate: (slotId: string) => void;
  onChanged?: () => void;
};

const findPrimaryCopyVariant = (slot: SlotDetail | null) => {
  const copyAsset = slot?.assets.find((asset) => asset.type === ContentAssetType.COPY);
  const variant = copyAsset?.variants?.[0];
  return { copyAsset, variant };
};

const formatHashtagsForTextarea = (value: string | null | undefined) => {
  if (!value) return "";
  // Prefer one hashtag per line in the editor (copy kit will format as space-separated)
  return value
    .split(/[\s,]+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join("\n");
};

const normalizeHashtagsFromTextareaToText = (value: string) => {
  const tokens = value
    .split(/[\s,]+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));
  return tokens.join(" ");
};

const safeClipboardWrite = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export function ContentReviewQueue({
  isOpen,
  slotId,
  queueIds,
  onClose,
  onNavigate,
  onChanged,
}: ContentReviewQueueProps) {
  const [slot, setSlot] = useState<SlotDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const regenTokenRef = useRef(0);

  const index = useMemo(() => queueIds.indexOf(slotId), [queueIds, slotId]);
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < queueIds.length - 1;

  const { copyAsset } = useMemo(() => findPrimaryCopyVariant(slot), [slot]);
  const variants = copyAsset?.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null,
    [selectedVariantId, variants]
  );

  const [draftTitle, setDraftTitle] = useState("");
  const [draftCopy, setDraftCopy] = useState("");
  const [draftHashtags, setDraftHashtags] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [reviseBusy, setReviseBusy] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    // Cancel any in-flight polling when the modal closes.
    regenTokenRef.current += 1;
    setRegenBusy(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        const response = await fetch(`/api/content/slots/${slotId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to load post");
        }
        const payload = await response.json();
        const nextSlot = payload.slot as SlotDetail;
        if (cancelled) return;
        setSlot(nextSlot);
        setDraftTitle(nextSlot.title ?? "");

        const nextCopyAsset = nextSlot.assets.find((asset) => asset.type === ContentAssetType.COPY);
        const nextVariant = nextCopyAsset?.variants?.[0] ?? null;
        setSelectedVariantId(nextVariant?.id ?? null);
        setDraftCopy(nextVariant?.copy ?? "");
        setDraftHashtags(formatHashtagsForTextarea(nextVariant?.hashtags));
        setAiInstruction("");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, slotId]);

  useEffect(() => {
    if (!slot) return;
    if (!selectedVariant) return;
    setDraftCopy(selectedVariant.copy ?? "");
    setDraftHashtags(formatHashtagsForTextarea(selectedVariant.hashtags));
    setAiInstruction("");
  }, [slot, selectedVariant?.id]);

  const getCopyFingerprint = (input: SlotDetail | null | undefined) => {
    const copyAsset = input?.assets.find((asset) => asset.type === ContentAssetType.COPY);
    const variant = copyAsset?.variants?.[0];
    return [copyAsset?.id ?? "", variant?.id ?? "", variant?.updatedAt ?? ""].join("|");
  };

  const refresh = async () => {
    if (!slotId) return;
    const response = await fetch(`/api/content/slots/${slotId}`);
    if (!response.ok) return;
    const payload = await response.json();
    const nextSlot = payload.slot as SlotDetail;
    setSlot(nextSlot);
    const nextCopyAsset = nextSlot.assets.find((asset) => asset.type === ContentAssetType.COPY);
    const nextVariants = nextCopyAsset?.variants ?? [];
    setSelectedVariantId((current) => {
      if (current && nextVariants.some((v) => v.id === current)) return current;
      return nextVariants[0]?.id ?? null;
    });
    return nextSlot;
  };

  const saveEdits = async () => {
    if (!slot) return;
    if (!selectedVariant) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/content/slots/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          title: draftTitle,
          variantId: selectedVariant.id,
          variant: selectedVariant
            ? {
                copy: draftCopy,
                hashtags: normalizeHashtagsFromTextareaToText(draftHashtags),
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to save changes");
      }

      onChanged?.();
      // refresh details after save
      await refresh();
      setNotice("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status: ContentSlotStatus) => {
    if (!slot) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/content/slots/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, status }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to update status");
      }
      onChanged?.();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    if (!slot) return;
    const beforeFingerprint = getCopyFingerprint(slot);
    const token = (regenTokenRef.current += 1);
    setSaving(true);
    setRegenBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          planId: undefined,
          title: slot.title,
          persona: slot.persona ?? "General audience",
          campaign: slot.campaign ?? "Monthly Autopilot",
          channels: [slot.channel],
          tone: ["warm", "expert", "premium"],
          goals: ["consultations", "education sales"],
          includeImages: true,
          prompt: slot.brief ?? `Create a ${slot.channel} post for: ${slot.title}`,
          scheduledFor: slot.scheduledFor ?? undefined,
          mode: "freeform",
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to regenerate");
      }
      onChanged?.();
      // Status + assets update after background job; poll the slot until copy changes.
      setNotice("Regenerating… waiting for the new caption to arrive.");

      let attempts = 0;
      const poll = async () => {
        if (regenTokenRef.current !== token) return;
        if (!isOpen) return;
        attempts += 1;

        const next = await refresh();
        const afterFingerprint = getCopyFingerprint(next ?? slot);

        if (afterFingerprint && afterFingerprint !== beforeFingerprint) {
          setNotice("Regenerated. Caption updated.");
          setRegenBusy(false);
          return;
        }

        if (attempts >= 20) {
          setNotice("Regeneration queued. If you don’t see updates yet, hit Refresh in ~30 seconds.");
          setRegenBusy(false);
          return;
        }

        setTimeout(poll, 1500);
      };

      setTimeout(poll, 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setRegenBusy(false);
    } finally {
      setSaving(false);
    }
  };

  const images = slot?.assets.filter((asset) => asset.type === ContentAssetType.IMAGE) ?? [];

  const generateImage = async () => {
    if (!slot) return;
    setImageBusy(true);
    setError(null);
    setNotice(null);
    try {
      const beforeCount = images.length;
      const response = await fetch("/api/content/slots/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id }),
      });
      const payload = await response.json().catch(() => ({} as any));
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to generate image");
      }
      const mode = payload?.mode as "queued" | "inline" | undefined;
      if (mode === "inline") {
        setNotice("Generating image now…");
        await refresh();
        setNotice("Image generated.");
        return;
      }

      setNotice("Image generation queued…");

      // Poll briefly for new images (best-effort).
      let attempts = 0;
      const poll = async () => {
        attempts += 1;
        const nextSlot = await refresh();
        const nextCount =
          (nextSlot?.assets.filter((asset) => asset.type === ContentAssetType.IMAGE) ?? []).length;
        if (nextCount > beforeCount) return;
        if (attempts >= 10) return;
        setTimeout(poll, 1500);
      };
      setTimeout(poll, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setImageBusy(false);
    }
  };

  const applyAiRevision = async () => {
    if (!slot) return;
    if (!selectedVariant) return;
    if (!aiInstruction.trim()) return;
    setReviseBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/content/slots/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          variantId: selectedVariant.id,
          instruction: aiInstruction.trim(),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to revise");
      }
      onChanged?.();
      await refresh();
      setNotice("Applied AI changes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setReviseBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Review</p>
            <h2 className="text-xl font-semibold text-black">Approve & polish</h2>
            <p className="text-xs text-black/50">
              {queueIds.length ? `Queue position: ${index + 1} / ${queueIds.length}` : "Queue"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => hasPrev && onNavigate(queueIds[index - 1])}
              disabled={!hasPrev}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => hasNext && onNavigate(queueIds[index + 1])}
              disabled={!hasNext}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-50"
            >
              Next
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60"
            >
              Close
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-black/60">Loading…</p>
        ) : error ? (
          <p className="text-sm text-brand-salmon">{error}</p>
        ) : slot ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              {notice ? (
                <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
                  <p className="text-sm text-black/70">{notice}</p>
                  {regenBusy ? (
                    <p className="mt-1 text-xs text-black/50">
                      Auto-refreshing… you can keep editing, but the caption may update when the new draft lands.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                  Title
                </span>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                  Variant
                </span>
                <select
                  value={selectedVariant?.id ?? ""}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                >
                  {variants.length ? (
                    variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {String(v.platform).toUpperCase()}
                        {v.headline ? ` — ${v.headline}` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="">No variants</option>
                  )}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Channel</p>
                  <p className="mt-1 text-sm font-semibold text-black">{slot.channel}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Status</p>
                  <p className="mt-1 text-sm font-semibold text-black">{slot.status}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Scheduled</p>
                  <p className="mt-1 text-sm font-semibold text-black">
                    {slot.scheduledFor ? new Date(slot.scheduledFor).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                  Caption
                </span>
                <textarea
                  value={draftCopy}
                  onChange={(e) => setDraftCopy(e.target.value)}
                  className="min-h-[220px] w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                />
                <p className="text-xs text-black/45">
                  Tip: Keep edits light — the whole point is “approve fast,” then copy/paste and post.
                </p>
              </label>

              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                  Hashtags
                </span>
                <textarea
                  value={draftHashtags}
                  onChange={(e) => setDraftHashtags(e.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                  placeholder="#trichology\n#scalphealth\n#hairloss"
                />
                <p className="text-xs text-black/45">One per line (we’ll format as paste-ready on copy).</p>
              </label>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Ask AI to change this</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    placeholder='e.g. "Make it shorter and more authoritative, keep the CTA."'
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applyAiRevision}
                      disabled={reviseBusy || !aiInstruction.trim() || !selectedVariant}
                      className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-60"
                    >
                      {reviseBusy ? "Applying…" : "Apply changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiInstruction("")}
                      disabled={reviseBusy || !aiInstruction}
                      className="rounded-full bg-black/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveEdits}
                  disabled={saving}
                  className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(ContentSlotStatus.APPROVED)}
                  disabled={saving}
                  className="rounded-full bg-[#c1d780] px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/70 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(ContentSlotStatus.DRAFT)}
                  disabled={saving}
                  className="rounded-full bg-black/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-60"
                >
                  Needs changes
                </button>
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={saving || regenBusy}
                  className="rounded-full bg-[#fab826] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#7d4e00] disabled:opacity-60"
                >
                  {regenBusy ? "Regenerating…" : "Regenerate post"}
                </button>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading || saving}
                  className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-white/70 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Images</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={generateImage}
                      disabled={imageBusy}
                      className="rounded-full bg-[#fab826] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#7d4e00] disabled:opacity-60"
                    >
                      {imageBusy ? "Generating…" : "Generate image"}
                    </button>
                    <button
                      type="button"
                      onClick={refresh}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                {images.length === 0 ? (
                  <p className="mt-3 text-sm text-black/60">
                    No images yet. Generate one now, or Regenerate the whole post.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {images.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                        {image.mediaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.mediaUrl}
                            alt={slot.title}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center bg-black/5 text-xs text-black/40">
                            Image pending
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Publishing kit</p>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await safeClipboardWrite(draftCopy);
                        setNotice(ok ? "Copied caption." : "Copy failed.");
                      }}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60"
                    >
                      Copy caption
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await safeClipboardWrite(normalizeHashtagsFromTextareaToText(draftHashtags));
                        setNotice(ok ? "Copied hashtags." : "Copy failed.");
                      }}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60"
                    >
                      Copy hashtags
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const combined = `${draftCopy}\n\n${normalizeHashtagsFromTextareaToText(draftHashtags)}`.trim();
                        const ok = await safeClipboardWrite(combined);
                        setNotice(ok ? "Copied caption + hashtags." : "Copy failed.");
                      }}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60"
                    >
                      Copy caption + hashtags
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const url = images[0]?.mediaUrl ?? "";
                        const ok = await safeClipboardWrite(url);
                        setNotice(ok ? "Copied image URL." : "Copy failed.");
                      }}
                      disabled={!images[0]?.mediaUrl}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60 disabled:opacity-50"
                    >
                      Copy image URL
                    </button>
                    {images[0]?.mediaUrl ? (
                      <a
                        href={images[0].mediaUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-black/5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black/60"
                      >
                        Download image
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/70 p-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Brief</p>
                <p className={clsx("mt-3 text-sm text-black/70 whitespace-pre-wrap", !slot.brief && "text-black/45")}>
                  {slot.brief ?? "—"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}



