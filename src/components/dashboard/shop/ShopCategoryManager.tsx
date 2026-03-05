"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  position: number;
};

export function ShopCategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/shop/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug, status: "ACTIVE" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Failed to create category");
      setNewName("");
      setNewSlug("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    await fetch(`/api/shop/categories/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-admin-border bg-admin-panel p-4 md:grid-cols-[1fr_1fr_auto]">
        <input className="rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input className="rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
        <button type="button" onClick={create} disabled={loading} className="rounded-md bg-admin-accent px-3 py-2 text-xs font-semibold text-black disabled:opacity-60">
          Add
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-admin-panel text-admin-text-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-admin-border">
                <td className="px-3 py-2 text-admin-text">{category.name}</td>
                <td className="px-3 py-2 text-admin-text-muted">{category.slug}</td>
                <td className="px-3 py-2 text-admin-text-muted">{category.status}</td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(category.id)} className="text-xs text-red-400">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-admin-text-muted" colSpan={4}>
                  No categories yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

