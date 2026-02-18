"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CollectionFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CollectionForm({ onSuccess, onCancel }: CollectionFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cms/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          type: "DOCUMENT", // Defaulting to DOCUMENT for now
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create collection");
      }

      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Instructional Box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-900">
          What is a Collection?
        </h4>
        <p className="text-sm text-blue-800/80">
          A Collection defines a specific type of content you want to manage on your site.
          Examples include <span className="font-medium">&quot;Blog Posts&quot;</span>,{" "}
          <span className="font-medium">&quot;Case Studies&quot;</span>, or{" "}
          <span className="font-medium">&quot;Team Members&quot;</span>.
          Once created, you can add individual entries to it.
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="block text-xs font-bold uppercase tracking-widest text-black/60">
            Name
          </label>
          <span className="text-[10px] text-black/40">
            e.g., &quot;Articles&quot; or &quot;Success Stories&quot;
          </span>
        </div>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Blog Posts"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm placeholder:text-black/20 focus:border-[#fab826] focus:outline-none"
          required
        />
        <p className="mt-1.5 text-[11px] text-black/40">
          The public-facing name for this group of content.
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="block text-xs font-bold uppercase tracking-widest text-black/60">
            Slug
          </label>
          <span className="text-[10px] text-black/40">Auto-generated</span>
        </div>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm font-mono text-black/70 focus:border-[#fab826] focus:bg-white focus:outline-none"
          required
          pattern="^[a-z0-9-]+$"
          title="Lowercase letters, numbers, and hyphens only"
        />
        <p className="mt-1.5 text-[11px] text-black/40">
          The unique ID used in URLs (e.g. /blog-posts). changing this later may break links.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-black/60">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Internal notes about this collection..."
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm placeholder:text-black/20 focus:border-[#fab826] focus:outline-none"
          rows={3}
        />
        <p className="mt-1.5 text-[11px] text-black/40">
          Optional internal note to help your team understand what content belongs here.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#fab826] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#7d4e00] shadow-sm hover:bg-[#e5a720] disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Collection"}
        </button>
      </div>
    </form>
  );
}

