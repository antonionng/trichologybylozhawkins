"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewConditionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Hair Loss");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/education/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          category,
          status: "DRAFT",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create condition");
      }

      router.push(`/dashboard/education/conditions/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create condition");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Hair Loss",
    "Scalp Dermatitis",
    "Scalp Infection",
    "Scalp & Hair Condition",
    "Other",
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/education/conditions"
          className="mb-2 inline-block text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black"
        >
          ← Back to Conditions
        </Link>
        <h1 className="font-display text-2xl text-black">Create New Condition</h1>
        <p className="text-black/60">Add a new hair or scalp condition to the reference library.</p>
      </div>

      <Surface variant="card" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">
              Condition Name
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              placeholder="e.g. Alopecia Areata"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">URL Slug</label>
            <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-black/50">
              <span className="text-xs">/conditions/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-black focus:outline-none"
                placeholder="alopecia-areata"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/dashboard/education/conditions"
              className="rounded-xl border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black/50 hover:text-black"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? "Creating..." : "Create Condition"}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}

