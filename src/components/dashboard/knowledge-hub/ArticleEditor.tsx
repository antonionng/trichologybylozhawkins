"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusBadge } from "@/components/admin/AdminBadge";

/* ─── Types ─── */

type ContentSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

type ArticleData = {
  id?: string;
  collectionId: string;
  title: string;
  slug: string;
  summary: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  meta: {
    category: string;
    readTime: string;
    heroImage?: string;
  };
  content: {
    sections: ContentSection[];
  };
  heroMediaId?: string;
  heroMediaUrl?: string;
};

interface ArticleEditorProps {
  initial: ArticleData;
  isNew: boolean;
}

const CATEGORIES = [
  "Hair Loss",
  "Scalp Health",
  "Consultations",
  "Clinical Guide",
  "Case Study",
  "Professional Development",
  "Product Science",
  "Wellness",
];

const SECTION_TYPES: { value: ContentSection["type"]; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "subheading", label: "Subheading" },
  { value: "list", label: "List" },
  { value: "callout", label: "Callout" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ArticleEditor({ initial, isNew }: ArticleEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiHeroLoading, setAiHeroLoading] = useState(false);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [summary, setSummary] = useState(initial.summary);
  const [category, setCategory] = useState(initial.meta.category);
  const [readTime, setReadTime] = useState(initial.meta.readTime || "5 min read");
  const [status, setStatus] = useState(initial.status);
  const [sections, setSections] = useState<ContentSection[]>(
    initial.content.sections || []
  );
  const [heroImage, setHeroImage] = useState(initial.meta.heroImage || "");
  const [heroMediaUrl, setHeroMediaUrl] = useState(initial.heroMediaUrl || "");
  const [heroMediaId, setHeroMediaId] = useState(initial.heroMediaId || "");
  const [autoSlug, setAutoSlug] = useState(isNew);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (autoSlug) setSlug(slugify(value));
    },
    [autoSlug]
  );

  const updateSection = (index: number, section: ContentSection) => {
    setSections((prev) => prev.map((s, i) => (i === index ? section : s)));
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addSection = (type: ContentSection["type"]) => {
    if (type === "list") {
      setSections((prev) => [...prev, { type: "list", items: [""] }]);
    } else {
      setSections((prev) => [...prev, { type, text: "" }]);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!initial.id) {
      const reader = new FileReader();
      reader.onload = () => setHeroMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("kind", "blog-hero");
      fd.set("entryId", initial.id);
      fd.set("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.media) {
        setHeroMediaId(data.media.id);
        setHeroMediaUrl(URL.createObjectURL(file));
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onGenerateAiDraft = async () => {
    setAiDraftLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/knowledge-hub-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "draft",
          category,
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(aiPrompt.trim() ? { prompt: aiPrompt.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "AI draft failed");
        return;
      }
      const d = data.draft as {
        title: string;
        slug: string;
        summary: string;
        readTime: string;
        category?: string;
        sections: ContentSection[];
      };
      setTitle(d.title);
      if (autoSlug) {
        setSlug(slugify(d.title));
      } else if (d.slug) {
        setSlug(d.slug);
      }
      setSummary(d.summary);
      setReadTime(d.readTime || "5 min read");
      if (d.category) {
        const match = CATEGORIES.find(
          (c) => c.toLowerCase() === d.category!.toLowerCase()
        );
        if (match) setCategory(match);
      }
      setSections(d.sections?.length ? d.sections : [{ type: "paragraph", text: "" }]);
    } catch {
      setError("AI draft failed");
    } finally {
      setAiDraftLoading(false);
    }
  };

  const onGenerateAiHero = async () => {
    if (!title.trim()) {
      setError("Add an article title before generating a hero image.");
      return;
    }
    setAiHeroLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/knowledge-hub-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "hero",
          title: title.trim(),
          category,
          ...(aiPrompt.trim() ? { prompt: aiPrompt.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "AI hero image failed");
        return;
      }
      setHeroMediaUrl("");
      setHeroMediaId("");
      setHeroImage(data.heroUrl as string);
    } catch {
      setError("AI hero image failed");
    } finally {
      setAiHeroLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...(initial.id ? { id: initial.id } : {}),
        collectionId: initial.collectionId,
        title,
        slug,
        summary,
        status,
        publishedAt:
          status === "PUBLISHED" ? new Date().toISOString() : undefined,
        meta: {
          category,
          readTime,
          heroImage: heroImage || undefined,
        },
        content: { sections },
        mediaIds: heroMediaId ? [heroMediaId] : [],
      };

      const res = await fetch("/api/cms/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      if (isNew && data.id) {
        router.push(`/dashboard/knowledge-hub/${data.id}`);
      }
      router.refresh();
    } catch {
      setError("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Header fields */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-admin-border bg-admin-panel p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none"
                placeholder="Article title..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-admin-text-muted">/blog/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  className="flex-1 rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none"
                  placeholder="article-slug"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                Excerpt / Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none resize-none"
                placeholder="Short summary shown on cards..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:border-admin-accent focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                  Read Time
                </label>
                <input
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none"
                  placeholder="5 min read"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-admin-border bg-admin-panel p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-admin-text">AI assistant</h3>
              <span className="text-[11px] text-admin-text-muted">Optional brief</span>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none resize-none"
              placeholder="e.g. Focus on postpartum shedding, cite gentle routines, UK audience…"
            />
            <p className="text-[11px] text-admin-text-muted leading-relaxed">
              Generate a full draft from your category (and title if set), or a hero image once you have a title.
              You can also create AI-assisted posts from{" "}
              <a
                href="/dashboard/content"
                className="text-admin-accent hover:underline"
              >
                Content Factory
              </a>{" "}
              (BLOG channel).
            </p>
            <div className="flex flex-wrap gap-2">
              <AdminButton
                type="button"
                variant="secondary"
                size="md"
                onClick={onGenerateAiDraft}
                loading={aiDraftLoading}
                disabled={aiDraftLoading || aiHeroLoading}
              >
                {aiDraftLoading ? "Generating…" : "Generate draft"}
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                size="md"
                onClick={onGenerateAiHero}
                loading={aiHeroLoading}
                disabled={aiDraftLoading || aiHeroLoading || !title.trim()}
              >
                {aiHeroLoading ? "Generating…" : "Generate hero image"}
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & publish */}
          <div className="rounded-lg border border-admin-border bg-admin-panel p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-text-muted">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ArticleData["status"])
                }
                className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:border-admin-accent focus:outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">In Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
            </div>

            <AdminButton
              onClick={handleSave}
              variant="primary"
              size="lg"
              loading={saving}
              disabled={!title.trim() || !slug.trim()}
              className="w-full"
            >
              {isNew ? "Create Article" : "Save Changes"}
            </AdminButton>
          </div>

          {/* Hero image */}
          <div className="rounded-lg border border-admin-border bg-admin-panel p-5 space-y-3">
            <label className="block text-xs font-medium text-admin-text-muted">
              Hero Image
            </label>

            {heroMediaUrl ? (
              <div className="relative">
                <img
                  src={heroMediaUrl}
                  alt="Hero"
                  className="h-40 w-full rounded-md object-cover"
                />
                <button
                  onClick={() => {
                    setHeroMediaUrl("");
                    setHeroMediaId("");
                    setHeroImage("");
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : heroImage ? (
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Hero"
                  className="h-40 w-full rounded-md object-cover"
                />
                <button
                  onClick={() => setHeroImage("")}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : null}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-admin-border-strong px-4 py-6 text-xs text-admin-text-muted hover:border-admin-accent hover:text-admin-accent transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {uploading ? "Uploading..." : "Upload hero image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
                disabled={uploading}
              />
            </label>

            <div>
              <label className="mb-1 block text-[11px] text-admin-text-muted">
                Or use an image URL
              </label>
              <input
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-1.5 text-xs text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="rounded-lg border border-admin-border bg-admin-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-admin-text">
            Article Content
          </h3>
          <span className="text-xs text-admin-text-muted">
            {sections.length} section{sections.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sections.map((section, idx) => (
          <div
            key={idx}
            className="rounded-md border border-admin-border bg-admin-elevated p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <select
                value={section.type}
                onChange={(e) => {
                  const newType = e.target.value as ContentSection["type"];
                  if (newType === "list") {
                    updateSection(idx, {
                      type: "list",
                      items: ["text" in section ? section.text : ""],
                    });
                  } else {
                    updateSection(idx, {
                      type: newType,
                      text:
                        "text" in section
                          ? section.text
                          : section.items?.join("\n") || "",
                    } as ContentSection);
                  }
                }}
                className="rounded border border-admin-border bg-admin-panel px-2 py-1 text-xs text-admin-text focus:outline-none"
              >
                {SECTION_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 text-admin-text-muted hover:text-admin-text disabled:opacity-30"
                  title="Move up"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === sections.length - 1}
                  className="rounded p-1 text-admin-text-muted hover:text-admin-text disabled:opacity-30"
                  title="Move down"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => removeSection(idx)}
                  className="rounded p-1 text-admin-text-muted hover:text-red-400"
                  title="Remove section"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {section.type === "list" ? (
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex gap-2">
                    <span className="mt-2 text-xs text-admin-text-muted">
                      {itemIdx + 1}.
                    </span>
                    <input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[itemIdx] = e.target.value;
                        updateSection(idx, { type: "list", items: newItems });
                      }}
                      className="flex-1 rounded border border-admin-border bg-admin-panel px-3 py-1.5 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none"
                      placeholder="List item..."
                    />
                    <button
                      onClick={() => {
                        const newItems = section.items.filter(
                          (_, i) => i !== itemIdx
                        );
                        updateSection(idx, {
                          type: "list",
                          items: newItems.length ? newItems : [""],
                        });
                      }}
                      className="text-admin-text-muted hover:text-red-400"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateSection(idx, {
                      type: "list",
                      items: [...section.items, ""],
                    })
                  }
                  className="text-xs text-admin-accent hover:text-admin-accent-hover"
                >
                  + Add item
                </button>
              </div>
            ) : (
              <textarea
                value={section.text}
                onChange={(e) =>
                  updateSection(idx, {
                    ...section,
                    text: e.target.value,
                  } as ContentSection)
                }
                rows={
                  section.type === "paragraph" || section.type === "callout"
                    ? 4
                    : 2
                }
                className="w-full rounded border border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted/50 focus:border-admin-accent focus:outline-none resize-y"
                placeholder={
                  section.type === "heading"
                    ? "Section heading..."
                    : section.type === "subheading"
                      ? "Sub-heading..."
                      : section.type === "callout"
                        ? "Important note or callout..."
                        : "Write your content here..."
                }
              />
            )}
          </div>
        ))}

        {/* Add section buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-admin-border">
          <span className="self-center text-xs text-admin-text-muted mr-2">
            Add:
          </span>
          {SECTION_TYPES.map((st) => (
            <button
              key={st.value}
              onClick={() => addSection(st.value)}
              className="rounded-md border border-admin-border px-3 py-1.5 text-xs text-admin-text-secondary hover:border-admin-accent hover:text-admin-accent transition-colors"
            >
              + {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
