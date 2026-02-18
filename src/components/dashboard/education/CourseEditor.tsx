"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/AdminBadge";
import { useToast } from "@/components/admin/Toast";
import { upsertCourse, upsertModule, upsertLesson, upsertPrice, upsertSession } from "@/app/actions/education";
import { CourseAiPanel } from "@/components/dashboard/education/CourseAiPanel";

type Props = { course: any; heroUrl?: string | null };

type TabKey = "overview" | "curriculum" | "sales" | "media" | "pricing" | "sessions" | "ai";

const TAB_DEFS: AdminTab[] = [
  { key: "overview", label: "Overview" },
  { key: "curriculum", label: "Curriculum" },
  { key: "sales", label: "Sales & Marketing" },
  { key: "media", label: "Media" },
  { key: "pricing", label: "Pricing" },
  { key: "sessions", label: "Cohorts" },
  { key: "ai", label: "AI Assistant" },
];

export function CourseEditor({ course, heroUrl }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryPrice = useMemo(
    () => course.pricing?.find((p: any) => p.isPrimary) ?? course.pricing?.[0] ?? null,
    [course.pricing]
  );

  const [form, setForm] = useState(() => ({
    title: course.title ?? "",
    slug: course.slug ?? "",
    subtitle: course.subtitle ?? "",
    description: course.description ?? "",
    category: course.category ?? "",
    durationMinutes: course.durationMinutes ? String(course.durationMinutes) : "",
    enrollmentType: course.enrollmentType ?? "ON_DEMAND",
    status: course.status ?? "DRAFT",
    learningOutcomes: (course.learningOutcomes ?? []) as string[],
    requirements: (course.requirements ?? []) as string[],
    targetAudience: (course.targetAudience ?? []) as string[],
    faqs: (course.faqs ?? []) as Array<{ question: string; answer: string }>,
  }));

  const onSaveOverview = async () => {
    setSaving(true);
    setError(null);
    try {
      await upsertCourse({
        id: course.id,
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        enrollmentType: form.enrollmentType,
        status: form.status,
        level: course.level ?? "GENERAL",
        heroMediaId: course.heroMediaId ?? null,
        learningOutcomes: form.learningOutcomes,
        requirements: form.requirements,
        targetAudience: form.targetAudience,
        faqs: form.faqs,
      } as any);
      toast("Course saved successfully", "success");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      toast("Failed to save course", "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (input: {
    kind: "course-hero" | "course-download" | "lesson-video" | "lesson-download";
    file: File;
    title?: string;
    lessonId?: string;
  }) => {
    const fd = new FormData();
    fd.set("kind", input.kind);
    fd.set("courseId", course.id);
    if (input.lessonId) fd.set("lessonId", input.lessonId);
    fd.set("file", input.file);
    if (input.title) fd.set("title", input.title);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Upload failed");
    toast("File uploaded", "success");
    router.refresh();
  };

  const addModule = async (title: string) => {
    await upsertModule({ courseId: course.id, title } as any);
    toast("Module added", "success");
    router.refresh();
  };

  const addLesson = async (moduleId: string, title: string) => {
    await upsertLesson({ moduleId, title } as any);
    toast("Lesson added", "success");
    router.refresh();
  };

  const saveLessonContent = async (lesson: { id: string; moduleId: string; title: string }, contentText: string) => {
    await upsertLesson({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      content: { text: contentText },
    } as any);
    toast("Lesson content saved", "success");
    router.refresh();
  };

  const savePrice = async (amount: number) => {
    await upsertPrice({
      courseId: course.id,
      amount,
      currency: primaryPrice?.currency ?? "GBP",
      billingType: "ONE_TIME",
      isPrimary: true,
    } as any);
    toast("Price saved", "success");
    router.refresh();
  };

  const addSession = async (cohortName: string, startDate?: string) => {
    await upsertSession({
      courseId: course.id,
      cohortName: cohortName || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      status: "UPCOMING",
    } as any);
    toast("Cohort added", "success");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title={form.title || "Untitled Course"}
        subtitle="Manage content, sales strategy, and delivery settings"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Courses", href: "/dashboard/education/courses" },
          { label: form.title || "Edit" },
        ]}
        actions={
          <>
            <AdminButton
              href={`/education/${course.slug}`}
              variant="ghost"
              size="md"
            >
              Preview as student
            </AdminButton>
            <AdminButton
              variant="primary"
              size="md"
              onClick={onSaveOverview}
              loading={saving}
            >
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

      {/* Tabs */}
      <AdminTabs tabs={TAB_DEFS} activeKey={tab} onChange={(k) => setTab(k as TabKey)} />

      {/* Tab content */}
      <div className="mt-4">
        {tab === "overview" && (
          <Panel variant="default" padding="lg" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInput
                label="Course Title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Clinical Scalp Analysis"
              />
              <AdminInput
                label="URL Slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="clinical-scalp-analysis"
                suffix={<span className="text-[10px]">/education/</span>}
              />
            </div>
            <AdminInput
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="The definitive guide for practitioners..."
            />
            <AdminTextarea
              label="Full Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={6}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInput
                label="Category"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
              <AdminInput
                label="Duration (mins)"
                value={form.durationMinutes}
                onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                inputMode="numeric"
              />
              <AdminSelect
                label="Delivery Type"
                value={form.enrollmentType}
                onChange={(e) => setForm((p) => ({ ...p, enrollmentType: e.target.value }))}
                options={[
                  { value: "ON_DEMAND", label: "On-demand" },
                  { value: "COHORT", label: "Cohort" },
                  { value: "LIVE", label: "Live" },
                  { value: "HYBRID", label: "Hybrid" },
                ]}
              />
              <AdminSelect
                label="Publish Status"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
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

        {tab === "curriculum" && (
          <Panel variant="default" padding="lg" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-admin-text">Modules & Lessons</h2>
                <p className="text-xs text-admin-text-muted">Structure your learning path</p>
              </div>
              <AddModuleForm onAdd={addModule} disabled={saving} />
            </div>

            <div className="space-y-4">
              {(course.modules ?? []).map((mod: any, idx: number) => (
                <div key={mod.id} className="rounded-lg border border-admin-border bg-admin-elevated p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-admin-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-admin-accent/10 text-[10px] font-semibold text-admin-accent">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-admin-text">{mod.title}</p>
                    </div>
                    <AddLessonForm moduleId={mod.id} onAdd={addLesson} />
                  </div>
                  <ul className="space-y-2">
                    {(mod.lessons ?? [])
                      .slice()
                      .sort((a: any, b: any) => a.position - b.position)
                      .map((lesson: any) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          onUpload={uploadFile}
                          onSaveContent={(contentText) =>
                            saveLessonContent(
                              { id: lesson.id, moduleId: mod.id, title: lesson.title },
                              contentText
                            )
                          }
                        />
                      ))}
                    {(mod.lessons ?? []).length === 0 && (
                      <li className="py-4 text-center text-xs text-admin-text-muted italic">No lessons in this module.</li>
                    )}
                  </ul>
                </div>
              ))}
              {(course.modules ?? []).length === 0 && (
                <div className="flex flex-col items-center py-12 text-center border border-dashed border-admin-border rounded-lg">
                  <p className="text-sm text-admin-text-muted">No modules yet</p>
                  <p className="text-xs text-admin-text-muted mt-1">Add your first module above</p>
                </div>
              )}
            </div>
          </Panel>
        )}

        {tab === "sales" && (
          <div className="space-y-4">
            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminTextarea
                  label="Learning Outcomes (one per line)"
                  value={form.learningOutcomes.join("\n")}
                  onChange={(e) => setForm((p) => ({ ...p, learningOutcomes: e.target.value.split("\n") }))}
                  rows={6}
                  placeholder="Master scalp diagnostic tools…"
                />
                <div className="space-y-4">
                  <AdminTextarea
                    label="Requirements"
                    value={form.requirements.join("\n")}
                    onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value.split("\n") }))}
                    rows={2}
                  />
                  <AdminTextarea
                    label="Target Audience"
                    value={form.targetAudience.join("\n")}
                    onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value.split("\n") }))}
                    rows={2}
                  />
                </div>
              </div>
            </Panel>

            <Panel variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-admin-text">FAQs</h3>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, faqs: [...p.faqs, { question: "", answer: "" }] }))}
                >
                  + Add Question
                </AdminButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.faqs.map((faq, idx) => (
                  <div key={idx} className="relative space-y-2 rounded-lg border border-admin-border bg-admin-elevated p-4">
                    <button
                      onClick={() => setForm((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== idx) }))}
                      className="absolute right-3 top-3 text-[10px] font-medium text-admin-danger hover:text-red-300"
                    >
                      Remove
                    </button>
                    <AdminInput
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...form.faqs];
                        newFaqs[idx].question = e.target.value;
                        setForm((p) => ({ ...p, faqs: newFaqs }));
                      }}
                      placeholder="Question"
                    />
                    <AdminTextarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...form.faqs];
                        newFaqs[idx].answer = e.target.value;
                        setForm((p) => ({ ...p, faqs: newFaqs }));
                      }}
                      rows={3}
                      placeholder="Answer…"
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {tab === "media" && (
          <div className="space-y-4">
            {/* Hero image preview + upload */}
            <Panel variant="default" padding="lg">
              <h3 className="mb-1 text-sm font-semibold text-admin-text">Course Hero Image</h3>
              <p className="mb-3 text-xs text-admin-text-muted">This image appears on course cards, the course detail page, and the homepage.</p>
              {heroUrl ? (
                <div className="group relative overflow-hidden rounded-lg border border-admin-border">
                  <img src={heroUrl} alt="Course hero" className="w-full max-h-52 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <label className="cursor-pointer rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-admin-bg shadow-lg hover:bg-white transition-colors">
                      Replace image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadFile({ kind: "course-hero", file: f });
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <UploadBox
                  label="Course Hero Visual"
                  description="High-resolution image for the landing page."
                  accept="image/*"
                  onUpload={(file) => uploadFile({ kind: "course-hero", file })}
                />
              )}
            </Panel>

            {/* Resources */}
            <Panel variant="default" padding="lg">
              <UploadBox
                label="Master Resources Bundle"
                description="PDFs, worksheets, or bulk lesson materials."
                accept=".pdf,.zip,image/*,video/*"
                onUpload={(file) => uploadFile({ kind: "course-download", file })}
              />
            </Panel>
          </div>
        )}

        {tab === "pricing" && (
          <Panel variant="default" padding="lg">
            <PriceForm
              currency={primaryPrice?.currency ?? "GBP"}
              amount={primaryPrice ? Number(primaryPrice.amount) : 0}
              onSave={savePrice}
            />
          </Panel>
        )}

        {tab === "sessions" && (
          <Panel variant="default" padding="lg" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-admin-text">Live & Cohort Sessions</h2>
                <p className="text-xs text-admin-text-muted">Manage specific dates and capacity</p>
              </div>
              <SessionForm onAdd={addSession} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(course.sessions ?? []).map((s: any) => (
                <div key={s.id} className="rounded-lg border border-admin-border bg-admin-elevated p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-admin-text">{s.cohortName ?? "Untitled"}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-xs text-admin-text-muted">
                    Starts: {s.startDate ? new Date(s.startDate).toLocaleDateString("en-GB", { dateStyle: "long" }) : "Not set"}
                  </p>
                </div>
              ))}
              {(course.sessions ?? []).length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-admin-text-muted italic">
                  No cohorts scheduled.
                </div>
              )}
            </div>
          </Panel>
        )}

        {tab === "ai" && (
          <CourseAiPanel course={course} />
        )}
      </div>
    </div>
  );
}

/* ── Sub-components (dark-styled) ── */

function UploadBox({ label, description, accept, onUpload }: {
  label: string; description: string; accept: string; onUpload: (file: File) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="rounded-lg border border-admin-border bg-admin-elevated p-4 space-y-2">
      <p className="text-xs font-medium text-admin-text-secondary">{label}</p>
      <p className="text-xs text-admin-text-muted">{description}</p>
      <input
        type="file"
        accept={accept}
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true); setError(null);
          try { await onUpload(file); e.target.value = ""; }
          catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
          finally { setBusy(false); }
        }}
        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-md file:border file:border-admin-border-strong file:bg-admin-panel file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-admin-text-secondary hover:file:bg-white/5"
      />
      {busy && <p className="text-xs text-admin-text-muted">Uploading…</p>}
      {error && <p className="text-xs text-admin-danger">{error}</p>}
    </div>
  );
}

function LessonRow({ lesson, onUpload, onSaveContent }: {
  lesson: any;
  onUpload: (input: { kind: "lesson-video" | "lesson-download"; file: File; lessonId: string }) => Promise<void>;
  onSaveContent: (contentText: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState(() => (lesson.content as any)?.text ?? "");
  const [saving, setSaving] = useState(false);
  const hasContent = Boolean((lesson.content as any)?.text);
  const resourceCount = Array.isArray((lesson.content as any)?.resources) ? (lesson.content as any).resources.length : 0;

  return (
    <li className="rounded-md border border-admin-border bg-admin-panel transition-colors">
      <div className="group flex items-center justify-between px-3 py-2 hover:border-admin-border-strong">
        <div className="min-w-0">
          <p className="text-sm text-admin-text">{lesson.title}</p>
          <p className="text-[10px] text-admin-text-muted">
            {hasContent ? "✓ Theory" : "No theory"} · {lesson.videoUrl ? "✓ Video" : "No video"} · {lesson.downloadableId ? "✓ Download" : "No download"}{resourceCount > 0 ? ` · ✓ ${resourceCount} resource${resourceCount !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-admin-border-strong bg-admin-panel px-2 py-1 text-[10px] font-medium text-admin-text-secondary hover:bg-white/5 transition-colors"
          >
            {expanded ? "Close" : "Edit Content"}
          </button>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
            <LessonUpload label="Video" accept="video/*" onUpload={(file) => onUpload({ kind: "lesson-video", file, lessonId: lesson.id })} />
            <LessonUpload label="File" accept=".pdf,.zip,image/*" onUpload={(file) => onUpload({ kind: "lesson-download", file, lessonId: lesson.id })} />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-admin-border px-3 py-3 space-y-3">
          <AdminTextarea
            label="Lesson Theory (Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder="Write your lesson content here using Markdown. Use ## for headings, **bold** for key terms, and > for clinical tips..."
          />
          <div className="flex items-center gap-3">
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try { await onSaveContent(content); }
                finally { setSaving(false); }
              }}
            >
              {saving ? "Saving…" : "Save Content"}
            </AdminButton>
            <span className="text-[10px] text-admin-text-muted">
              {content.length > 0 ? `${content.split(/\s+/).filter(Boolean).length} words` : "Empty"}
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

function LessonUpload({ label, accept, onUpload }: {
  label: string; accept: string; onUpload: (file: File) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-admin-border-strong bg-admin-panel px-2 py-1 text-[10px] font-medium text-admin-text-secondary hover:bg-white/5 transition-colors">
      <span>{busy ? "…" : label}</span>
      <input type="file" accept={accept} className="hidden" disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          setBusy(true);
          try { await onUpload(file); } finally { setBusy(false); e.target.value = ""; }
        }}
      />
    </label>
  );
}

function AddModuleForm({ onAdd, disabled }: { onAdd: (title: string) => Promise<void>; disabled?: boolean }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <AdminInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New module title"
        disabled={busy || disabled}
      />
      <AdminButton variant="secondary" size="sm" disabled={busy || disabled || !title.trim()}
        onClick={async () => { setBusy(true); try { await onAdd(title.trim()); setTitle(""); } finally { setBusy(false); } }}
      >
        Add
      </AdminButton>
    </div>
  );
}

function AddLessonForm({ moduleId, onAdd }: { moduleId: string; onAdd: (moduleId: string, title: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <AdminInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New lesson"
        disabled={busy}
      />
      <AdminButton variant="secondary" size="sm" disabled={busy || !title.trim()}
        onClick={async () => { setBusy(true); try { await onAdd(moduleId, title.trim()); setTitle(""); } finally { setBusy(false); } }}
      >
        Add lesson
      </AdminButton>
    </div>
  );
}

function PriceForm({ currency, amount, onSave }: { currency: string; amount: number; onSave: (amount: number) => Promise<void> }) {
  const [val, setVal] = useState(amount ? String(amount) : "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <AdminInput
        label={`Amount (${currency})`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        inputMode="decimal"
      />
      <AdminButton variant="secondary" size="md" disabled={busy || !val || Number.isNaN(Number(val))}
        onClick={async () => { setBusy(true); try { await onSave(Number(val)); } finally { setBusy(false); } }}
      >
        Save price
      </AdminButton>
    </div>
  );
}

function SessionForm({ onAdd }: { onAdd: (cohortName: string, startDate?: string) => Promise<void> }) {
  const [cohortName, setCohortName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-end gap-2">
      <AdminInput label="Cohort name" value={cohortName} onChange={(e) => setCohortName(e.target.value)} placeholder="e.g. Feb 2026" disabled={busy} />
      <AdminInput label="Start date" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={busy} />
      <AdminButton variant="secondary" size="md" disabled={busy}
        onClick={async () => { setBusy(true); try { await onAdd(cohortName, startDate || undefined); setCohortName(""); setStartDate(""); } finally { setBusy(false); } }}
      >
        Add cohort
      </AdminButton>
    </div>
  );
}
