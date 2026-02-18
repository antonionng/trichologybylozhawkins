"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/admin/Toast";
import { upsertWorkshop } from "@/app/actions/education";
import { WorkshopAiPanel } from "./WorkshopAiPanel";

type Props = { workshop: any; heroUrl?: string | null };

type TabKey = "overview" | "content" | "sales" | "media" | "ai";

const TAB_DEFS: AdminTab[] = [
  { key: "overview", label: "Overview" },
  { key: "content", label: "Content" },
  { key: "sales", label: "Sales & Marketing" },
  { key: "media", label: "Media" },
  { key: "ai", label: "AI Assistant" },
];

export function WorkshopEditor({ workshop, heroUrl }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(() => ({
    title: workshop.title ?? "",
    slug: workshop.slug ?? "",
    headline: workshop.headline ?? "",
    summary: workshop.summary ?? "",
    longDescription: workshop.longDescription ?? "",
    duration: workshop.duration ?? "",
    investment: workshop.investment ?? "",
    location: workshop.location ?? "",
    status: workshop.status ?? "DRAFT",
    ctaLabel: workshop.ctaLabel ?? "",
    ctaHref: workshop.ctaHref ?? "",
    outcomes: (workshop.outcomes ?? []) as string[],
    whoItsFor: (workshop.whoItsFor ?? []) as string[],
    whatYouGet: (workshop.whatYouGet ?? []) as string[],
    agenda: (workshop.agenda ?? []) as Array<{
      title: string;
      description: string;
    }>,
    faqs: (workshop.faqs ?? []) as Array<{
      question: string;
      answer: string;
    }>,
    testimonials: (workshop.testimonials ?? []) as Array<{
      quote: string;
      author: string;
      role: string;
    }>,
  }));

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await upsertWorkshop({
        id: workshop.id,
        title: form.title,
        slug: form.slug,
        headline: form.headline || undefined,
        summary: form.summary || undefined,
        longDescription: form.longDescription || undefined,
        duration: form.duration || undefined,
        investment: form.investment || undefined,
        location: form.location || undefined,
        status: form.status,
        ctaLabel: form.ctaLabel || undefined,
        ctaHref: form.ctaHref || undefined,
        outcomes: form.outcomes.filter(Boolean),
        whoItsFor: form.whoItsFor.filter(Boolean),
        whatYouGet: form.whatYouGet.filter(Boolean),
        agenda: form.agenda,
        faqs: form.faqs,
        testimonials: form.testimonials,
        heroMediaId: workshop.heroMediaId ?? null,
      } as any);
      toast("Workshop saved successfully", "success");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      toast("Failed to save workshop", "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.set("kind", "workshop-hero");
    fd.set("workshopId", workshop.id);
    fd.set("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Upload failed");
    toast("Image uploaded", "success");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={form.title || "Untitled Workshop"}
        subtitle="Manage workshop content, imagery, and sales copy"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Workshops", href: "/dashboard/education/workshops" },
          { label: form.title || "Edit" },
        ]}
        actions={
          <>
            <AdminButton
              href={`/education/workshops/${workshop.slug}`}
              variant="ghost"
              size="md"
            >
              Preview page
            </AdminButton>
            <AdminButton
              variant="primary"
              size="md"
              onClick={onSave}
              loading={saving}
            >
              {saving ? "Saving\u2026" : "Save Changes"}
            </AdminButton>
          </>
        }
      />

      {error && (
        <Panel
          variant="elevated"
          padding="sm"
          className="border-admin-danger/30 text-admin-danger text-sm"
        >
          {error}
        </Panel>
      )}

      <AdminTabs
        tabs={TAB_DEFS}
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
      />

      <div className="mt-4">
        {/* ── Overview ── */}
        {tab === "overview" && (
          <Panel variant="default" padding="lg" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInput
                label="Workshop Title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Advanced Scalp Treatment Workshop"
              />
              <AdminInput
                label="URL Slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="advanced-scalp-treatment-workshop"
                suffix={
                  <span className="text-[10px]">/education/workshops/</span>
                }
              />
            </div>
            <AdminInput
              label="Headline"
              value={form.headline}
              onChange={(e) =>
                setForm((p) => ({ ...p, headline: e.target.value }))
              }
              placeholder="A punchy, benefit-driven headline"
            />
            <AdminTextarea
              label="Summary"
              value={form.summary}
              onChange={(e) =>
                setForm((p) => ({ ...p, summary: e.target.value }))
              }
              rows={3}
              placeholder="Brief description shown on cards"
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <AdminInput
                label="Duration"
                value={form.duration}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration: e.target.value }))
                }
                placeholder="e.g. 2 days"
              />
              <AdminInput
                label="Investment"
                value={form.investment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, investment: e.target.value }))
                }
                placeholder="e.g. \u00A31,250"
              />
              <AdminInput
                label="Location"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="e.g. London studio or at your location"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminSelect
                label="Publish Status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "REVIEW", label: "Review" },
                  { value: "PUBLISHED", label: "Published" },
                  { value: "RETIRED", label: "Retired" },
                ]}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminInput
                  label="CTA Button Label"
                  value={form.ctaLabel}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ctaLabel: e.target.value }))
                  }
                  placeholder="Reserve your place"
                />
                <AdminInput
                  label="CTA Link"
                  value={form.ctaHref}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ctaHref: e.target.value }))
                  }
                  placeholder="/contact?intensive=..."
                />
              </div>
            </div>
          </Panel>
        )}

        {/* ── Content ── */}
        {tab === "content" && (
          <div className="space-y-4">
            <Panel variant="default" padding="lg" className="space-y-4">
              <AdminTextarea
                label="Long Description"
                value={form.longDescription}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    longDescription: e.target.value,
                  }))
                }
                rows={10}
                placeholder="Persuasive, multi-paragraph description. Use \n for paragraphs."
              />
            </Panel>

            {/* Agenda */}
            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-admin-text">
                  Agenda
                </h3>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      agenda: [
                        ...p.agenda,
                        { title: "", description: "" },
                      ],
                    }))
                  }
                >
                  + Add Session
                </AdminButton>
              </div>
              <div className="space-y-3">
                {form.agenda.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative space-y-2 rounded-lg border border-admin-border bg-admin-elevated p-4"
                  >
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          agenda: p.agenda.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute right-3 top-3 text-[10px] font-medium text-admin-danger hover:text-red-300"
                    >
                      Remove
                    </button>
                    <AdminInput
                      value={item.title}
                      onChange={(e) => {
                        const next = [...form.agenda];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setForm((p) => ({ ...p, agenda: next }));
                      }}
                      placeholder="Session title (e.g. Morning — Scalp Science)"
                    />
                    <AdminTextarea
                      value={item.description}
                      onChange={(e) => {
                        const next = [...form.agenda];
                        next[idx] = {
                          ...next[idx],
                          description: e.target.value,
                        };
                        setForm((p) => ({ ...p, agenda: next }));
                      }}
                      rows={3}
                      placeholder="What's covered in this session..."
                    />
                  </div>
                ))}
              </div>
            </Panel>

            {/* Testimonials */}
            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-admin-text">
                  Testimonials
                </h3>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      testimonials: [
                        ...p.testimonials,
                        { quote: "", author: "", role: "" },
                      ],
                    }))
                  }
                >
                  + Add Testimonial
                </AdminButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="relative space-y-2 rounded-lg border border-admin-border bg-admin-elevated p-4"
                  >
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          testimonials: p.testimonials.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      className="absolute right-3 top-3 text-[10px] font-medium text-admin-danger hover:text-red-300"
                    >
                      Remove
                    </button>
                    <AdminTextarea
                      value={t.quote}
                      onChange={(e) => {
                        const next = [...form.testimonials];
                        next[idx] = { ...next[idx], quote: e.target.value };
                        setForm((p) => ({ ...p, testimonials: next }));
                      }}
                      rows={3}
                      placeholder="Quote..."
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <AdminInput
                        value={t.author}
                        onChange={(e) => {
                          const next = [...form.testimonials];
                          next[idx] = {
                            ...next[idx],
                            author: e.target.value,
                          };
                          setForm((p) => ({ ...p, testimonials: next }));
                        }}
                        placeholder="Name"
                      />
                      <AdminInput
                        value={t.role}
                        onChange={(e) => {
                          const next = [...form.testimonials];
                          next[idx] = { ...next[idx], role: e.target.value };
                          setForm((p) => ({ ...p, testimonials: next }));
                        }}
                        placeholder="Role / Company"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* ── Sales & Marketing ── */}
        {tab === "sales" && (
          <div className="space-y-4">
            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminTextarea
                  label="Learning Outcomes (one per line)"
                  value={form.outcomes.join("\n")}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      outcomes: e.target.value.split("\n"),
                    }))
                  }
                  rows={6}
                  placeholder="Master scalp assessment..."
                />
                <div className="space-y-4">
                  <AdminTextarea
                    label="Who It's For (one per line)"
                    value={form.whoItsFor.join("\n")}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        whoItsFor: e.target.value.split("\n"),
                      }))
                    }
                    rows={4}
                    placeholder="Stylists who want to..."
                  />
                  <AdminTextarea
                    label="What You Get (one per line)"
                    value={form.whatYouGet.join("\n")}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        whatYouGet: e.target.value.split("\n"),
                      }))
                    }
                    rows={4}
                    placeholder="Two full days of training..."
                  />
                </div>
              </div>
            </Panel>

            {/* FAQs */}
            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-admin-text">FAQs</h3>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      faqs: [...p.faqs, { question: "", answer: "" }],
                    }))
                  }
                >
                  + Add Question
                </AdminButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="relative space-y-2 rounded-lg border border-admin-border bg-admin-elevated p-4"
                  >
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          faqs: p.faqs.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute right-3 top-3 text-[10px] font-medium text-admin-danger hover:text-red-300"
                    >
                      Remove
                    </button>
                    <AdminInput
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...form.faqs];
                        next[idx] = {
                          ...next[idx],
                          question: e.target.value,
                        };
                        setForm((p) => ({ ...p, faqs: next }));
                      }}
                      placeholder="Question"
                    />
                    <AdminTextarea
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...form.faqs];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        setForm((p) => ({ ...p, faqs: next }));
                      }}
                      rows={3}
                      placeholder="Answer..."
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* ── Media ── */}
        {tab === "media" && (
          <Panel variant="default" padding="lg">
            <h3 className="mb-1 text-sm font-semibold text-admin-text">
              Workshop Hero Image
            </h3>
            <p className="mb-3 text-xs text-admin-text-muted">
              This image appears on workshop cards and the detail page.
            </p>
            {heroUrl ? (
              <div className="group relative overflow-hidden rounded-lg border border-admin-border">
                <img
                  src={heroUrl}
                  alt="Workshop hero"
                  className="w-full max-h-52 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <label className="cursor-pointer rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-admin-bg shadow-lg hover:bg-white transition-colors">
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-admin-border bg-admin-elevated p-4 space-y-2">
                <p className="text-xs font-medium text-admin-text-secondary">
                  Workshop Hero Visual
                </p>
                <p className="text-xs text-admin-text-muted">
                  High-resolution image for the landing page.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        await uploadFile(file);
                      } catch (err) {
                        toast(
                          err instanceof Error
                            ? err.message
                            : "Upload failed",
                          "error"
                        );
                      }
                      e.target.value = "";
                    }
                  }}
                  className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-md file:border file:border-admin-border-strong file:bg-admin-panel file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-admin-text-secondary hover:file:bg-white/5"
                />
              </div>
            )}
          </Panel>
        )}

        {/* ── AI ── */}
        {tab === "ai" && <WorkshopAiPanel workshop={workshop} />}
      </div>
    </div>
  );
}
