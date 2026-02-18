"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/admin/Toast";
import { deleteVideoProduct, upsertVideoPrice, upsertVideoProduct } from "@/app/actions/education";

const TAB_DEFS: AdminTab[] = [
  { key: "overview", label: "Overview" },
  { key: "media", label: "Media" },
  { key: "pricing", label: "Pricing" },
  { key: "ai", label: "AI Content" },
];

export function VideoEditor({ video, heroUrl }: { video: any; heroUrl?: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const primaryPrice = useMemo(
    () => video.pricing?.find((p: any) => p.isPrimary) ?? video.pricing?.[0] ?? null,
    [video.pricing]
  );

  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState(() => ({
    title: video.title ?? "",
    slug: video.slug ?? "",
    subtitle: video.subtitle ?? "",
    description: video.description ?? "",
    category: video.category ?? "",
    durationMinutes: video.durationMinutes ? String(video.durationMinutes) : "",
    status: video.status ?? "DRAFT",
    videoSourceType: video.videoSourceType ?? "UPLOAD",
    videoUrl: video.videoUrl ?? "",
    priceAmount: primaryPrice?.amount ? String(primaryPrice.amount) : "",
    currency: primaryPrice?.currency ?? "GBP",
  }));

  const uploadFile = async (input: { kind: "video-product-hero" | "video-product-video"; file: File; title?: string }) => {
    setUploading(input.kind);
    setError(null);
    try {
      // Step 1: Get a signed upload URL from the server
      const prepRes = await fetch("/api/media/prepare-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: input.kind,
          videoProductId: video.id,
          filename: input.file.name,
          contentType: input.file.type || "application/octet-stream",
        }),
      });
      const prepJson = await prepRes.json();
      if (!prepRes.ok) throw new Error(prepJson?.error ?? "Failed to prepare upload");

      // Step 2: Upload directly to Supabase storage (bypasses Next.js body limit)
      const uploadRes = await fetch(prepJson.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": input.file.type || "application/octet-stream" },
        body: input.file,
      });
      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => "");
        throw new Error(text || `Upload failed (${uploadRes.status})`);
      }

      // Step 3: Confirm the upload and update the database
      const confirmRes = await fetch("/api/media/confirm-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: input.kind,
          videoProductId: video.id,
          storagePath: prepJson.storagePath,
          contentType: input.file.type || "application/octet-stream",
          title: input.title,
          sizeBytes: input.file.size,
        }),
      });
      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmJson?.error ?? "Failed to save upload record");

      toast("File uploaded", "success");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setUploading(null);
    }
  };

  const onSave = async () => {
    setSaving(true); setError(null);
    try {
      await upsertVideoProduct({
        id: video.id, title: form.title, slug: form.slug,
        subtitle: form.subtitle || undefined, description: form.description || undefined,
        category: form.category || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        status: form.status, videoSourceType: form.videoSourceType,
        videoUrl: form.videoSourceType === "LINK" ? (form.videoUrl.trim() || null) : null,
        videoPath: form.videoSourceType === "LINK" ? null : undefined,
        heroMediaId: video.heroMediaId ?? null,
      } as any);
      if (form.priceAmount.trim()) {
        await upsertVideoPrice({
          videoProductId: video.id, amount: Number(form.priceAmount),
          currency: form.currency || "GBP", billingType: "ONE_TIME", isPrimary: true,
        } as any);
      }
      toast("Video saved", "success");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      toast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    setSaving(true); setError(null);
    try {
      await deleteVideoProduct(video.id);
      toast("Video deleted", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      toast("Failed to delete", "error");
      setSaving(false);
    }
  };

  const onGenerateAiPages = async () => {
    setAiLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/video-product-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoProductId: video.id, ...(aiPrompt.trim() ? { prompt: aiPrompt } : {}) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "AI generation failed");
      toast("AI content generated!", "success");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed");
      toast("AI generation failed", "error");
    } finally { setAiLoading(false); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={form.title || "Untitled Video"}
        subtitle="Edit details, media, pricing, and AI content"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Videos", href: "/dashboard/education/videos" },
          { label: form.title || "Edit" },
        ]}
        actions={
          <>
            <AdminButton href={`/academy/videos/${video.id}`} variant="ghost" size="md">
              Preview
            </AdminButton>
            <AdminButton variant="primary" size="md" onClick={onSave} loading={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </AdminButton>
          </>
        }
      />

      {error && (
        <Panel variant="elevated" padding="sm" className="border-admin-danger/30 text-admin-danger text-sm">
          {error}
        </Panel>
      )}

      <AdminTabs tabs={TAB_DEFS} activeKey={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === "overview" && (
          <Panel variant="default" padding="lg" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInput label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              <AdminInput label="URL Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} suffix={<span className="text-[10px]">/education/videos/</span>} />
            </div>
            <AdminInput label="Subtitle" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
            <AdminTextarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} />
            <div className="grid gap-4 lg:grid-cols-3">
              <AdminInput label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
              <AdminInput label="Duration (mins)" value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))} inputMode="numeric" />
              <AdminSelect label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "REVIEW", label: "Review" },
                  { value: "PUBLISHED", label: "Published" },
                  { value: "RETIRED", label: "Retired" },
                ]}
              />
            </div>
          </Panel>
        )}

        {tab === "media" && (
          <Panel variant="default" padding="lg" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Hero image */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-admin-text-secondary">Hero Image</p>
                {heroUrl ? (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-lg border border-admin-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroUrl} alt="Current hero" className="h-40 w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
                        <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity hover:opacity-100 [div:hover>&]:opacity-100">
                          Replace
                        </span>
                      </div>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-admin-border-strong bg-admin-panel px-3 py-1.5 text-xs font-medium text-admin-text-secondary transition-colors hover:bg-white/5">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      {uploading === "video-product-hero" ? "Uploading…" : "Replace image"}
                      <input type="file" accept="image/*" className="hidden"
                        disabled={uploading === "video-product-hero"}
                        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadFile({ kind: "video-product-hero", file: f, title: "Video hero" }); }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-admin-border bg-admin-elevated">
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-admin-text-muted/40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                        <p className="mt-1 text-[10px] text-admin-text-muted">No hero image</p>
                      </div>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-admin-border-strong bg-admin-panel px-3 py-1.5 text-xs font-medium text-admin-text-secondary transition-colors hover:bg-white/5">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      {uploading === "video-product-hero" ? "Uploading…" : "Upload hero image"}
                      <input type="file" accept="image/*" className="hidden"
                        disabled={uploading === "video-product-hero"}
                        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadFile({ kind: "video-product-hero", file: f, title: "Video hero" }); }}
                      />
                    </label>
                  </div>
                )}
                <p className="text-[10px] text-admin-text-muted">This image appears on video cards and the course detail page.</p>
              </div>

              {/* Video source */}
              <div className="space-y-3">
                <AdminSelect label="Video Source" value={form.videoSourceType} onChange={(e) => setForm((p) => ({ ...p, videoSourceType: e.target.value }))}
                  options={[{ value: "UPLOAD", label: "Upload File" }, { value: "LINK", label: "External Link" }]}
                />
                {form.videoSourceType === "UPLOAD" ? (
                  <>
                    <input type="file" accept="video/*"
                      disabled={uploading === "video-product-video"}
                      onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadFile({ kind: "video-product-video", file: f, title: "Video file" }); }}
                      className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-md file:border file:border-admin-border-strong file:bg-admin-panel file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-admin-text-secondary hover:file:bg-white/5 disabled:opacity-50"
                    />
                    <p className="text-xs text-admin-text-muted">
                      {uploading === "video-product-video"
                        ? "Uploading video… please wait."
                        : video.videoPath
                          ? "Video uploaded."
                          : "No video yet."}
                    </p>
                    {uploading === "video-product-video" && (
                      <div className="h-1 w-full overflow-hidden rounded-full bg-admin-border">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-admin-accent" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <AdminInput value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="https://…" />
                    <p className="text-xs text-admin-text-muted">YouTube, Vimeo, or direct video URL.</p>
                  </>
                )}
              </div>
            </div>

            {/* Video preview if link exists */}
            {form.videoSourceType === "LINK" && form.videoUrl && (
              <div className="rounded-lg border border-admin-border bg-admin-elevated overflow-hidden">
                <p className="px-4 py-2 text-xs font-medium text-admin-text-muted border-b border-admin-border">Preview</p>
                <div className="aspect-video">
                  {form.videoUrl.includes("youtube") || form.videoUrl.includes("youtu.be") ? (
                    <iframe src={form.videoUrl.replace("watch?v=", "embed/")} className="h-full w-full" allowFullScreen />
                  ) : form.videoUrl.includes("vimeo") ? (
                    <iframe src={form.videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")} className="h-full w-full" allowFullScreen />
                  ) : (
                    <video src={form.videoUrl} controls className="h-full w-full object-contain" />
                  )}
                </div>
              </div>
            )}
          </Panel>
        )}

        {tab === "pricing" && (
          <Panel variant="default" padding="lg" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_140px]">
              <AdminInput label="Amount" value={form.priceAmount} onChange={(e) => setForm((p) => ({ ...p, priceAmount: e.target.value }))} inputMode="decimal" placeholder="35"
                description={primaryPrice ? `Current: ${primaryPrice.currency} ${primaryPrice.amount}` : "No price configured yet"}
              />
              <AdminInput label="Currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
            </div>
          </Panel>
        )}

        {tab === "ai" && (
          <div className="space-y-6">
            {/* Current member notes preview */}
            {(() => {
              const mc = (video.memberContent ?? {}) as any;
              const hasNotes = mc.notes || (Array.isArray(mc.keyTakeaways) && mc.keyTakeaways.length > 0);
              return (
                <Panel variant="default" padding="lg" className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-admin-text">Member Notes</h2>
                    <p className="text-xs text-admin-text-muted mt-1">
                      These notes are shown to enrolled learners on the video playback page.
                    </p>
                  </div>
                  {hasNotes ? (
                    <div className="space-y-3 rounded-lg border border-admin-border bg-admin-elevated p-4">
                      {mc.notes && (
                        <p className="text-xs leading-relaxed text-admin-text-secondary">{mc.notes}</p>
                      )}
                      {Array.isArray(mc.keyTakeaways) && mc.keyTakeaways.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-admin-text-muted">Key takeaways</p>
                          <ul className="space-y-1">
                            {mc.keyTakeaways.map((t: string, i: number) => (
                              <li key={i} className="flex gap-2 text-xs text-admin-text-secondary">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-accent/40" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(mc.nextSteps) && mc.nextSteps.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-admin-text-muted">Next steps</p>
                          <ul className="space-y-1">
                            {mc.nextSteps.map((s: string, i: number) => (
                              <li key={i} className="flex gap-2 text-xs text-admin-text-secondary">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-accent/40" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-admin-border bg-admin-elevated/50 px-4 py-6">
                      <svg className="h-5 w-5 text-admin-text-muted/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <p className="text-xs text-admin-text-muted">No member notes yet. Use the generator below to create them.</p>
                    </div>
                  )}
                </Panel>
              );
            })()}

            {/* AI generation */}
            <Panel variant="default" padding="lg" className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-admin-text">AI Content Generation</h2>
                <p className="text-xs text-admin-text-muted mt-1">
                  Generate public purchase-page copy and member-only video notes in one step.
                </p>
              </div>
              <AdminTextarea
                label="Brief (optional)"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={5}
                placeholder="Example: Focus on microscopic diagnostics, common mistakes, and client communication…"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-admin-text-muted">
                  Updates <span className="font-medium text-admin-text-secondary">public</span> and{" "}
                  <span className="font-medium text-admin-text-secondary">member</span> content blocks.
                </p>
                <AdminButton variant="primary" size="md" onClick={onGenerateAiPages} loading={aiLoading}>
                  {aiLoading ? "Generating…" : "Generate with AI"}
                </AdminButton>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <Panel variant="default" padding="md" className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-admin-text-muted uppercase tracking-wider">Danger Zone</p>
          <p className="text-xs text-admin-text-muted mt-0.5">Delete this video product permanently.</p>
        </div>
        <AdminButton variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete Video
        </AdminButton>
      </Panel>

      {/* Delete confirmation modal */}
      <AdminModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Video Product"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={onDelete} loading={saving}>
              Delete permanently
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-admin-text-secondary">
          Are you sure you want to delete <span className="font-medium text-admin-text">{form.title}</span>? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
