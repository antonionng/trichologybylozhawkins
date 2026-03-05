"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Product = {
  id?: string;
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  stockQuantity?: number;
  status?: string;
  perfectFor?: string | null;
  ingredients?: string | null;
  keyIngredients?: string[];
  heroMediaId?: string | null;
  imageMediaIds?: string[];
  heroUrl?: string | null;
  galleryUrls?: string[];
};

export function ShopProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<null | "hero" | "gallery">(null);
  const [error, setError] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState(initial?.heroUrl ?? null);
  const [galleryPreview, setGalleryPreview] = useState<string[]>(initial?.galleryUrls ?? []);
  const [heroMediaId, setHeroMediaId] = useState<string | null>(initial?.heroMediaId ?? null);
  const [imageMediaIds, setImageMediaIds] = useState<string[]>(initial?.imageMediaIds ?? []);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? "",
    price: String(initial?.price ?? ""),
    compareAtPrice: initial?.compareAtPrice ? String(initial.compareAtPrice) : "",
    sku: initial?.sku ?? "",
    stockQuantity: String(initial?.stockQuantity ?? 0),
    status: initial?.status ?? "DRAFT",
    perfectFor: initial?.perfectFor ?? "",
    ingredients: initial?.ingredients ?? "",
    keyIngredients: (initial?.keyIngredients ?? []).join(", "),
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        description: form.description,
        categoryId: form.categoryId || null,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        sku: form.sku || undefined,
        stockQuantity: Number(form.stockQuantity || 0),
        status: form.status,
        perfectFor: form.perfectFor || undefined,
        ingredients: form.ingredients || undefined,
        keyIngredients: form.keyIngredients
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        heroMediaId,
        imageMediaIds,
      };
      const endpoint = initial?.id
        ? `/api/shop/products/${initial.id}`
        : "/api/shop/products";
      const method = initial?.id ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to save product");
      router.push("/dashboard/shop/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (kind: "shop-product-hero" | "shop-product-image", file: File) => {
    if (!initial?.id) {
      setError("Save this product first, then upload images.");
      return;
    }
    setError(null);
    setUploading(kind === "shop-product-hero" ? "hero" : "gallery");
    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("shopProductId", initial.id);
      formData.set("file", file);
      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Upload failed");
      }
      if (kind === "shop-product-hero") {
        if (payload?.media?.id) setHeroMediaId(payload.media.id);
        if (payload?.media?.path) {
          setHeroPreview((prev) => prev ?? URL.createObjectURL(file));
        }
      } else {
        if (payload?.media?.id) setImageMediaIds((prev) => [...prev, payload.media.id]);
        setGalleryPreview((prev) => [...prev, URL.createObjectURL(file)]);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-admin-border bg-admin-panel p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Compare-at price" value={form.compareAtPrice} onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))} />
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
        <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Stock quantity" value={form.stockQuantity} onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
        <select className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
      <textarea className="h-28 w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Perfect for" value={form.perfectFor} onChange={(e) => setForm((p) => ({ ...p, perfectFor: e.target.value }))} />
      <textarea className="h-24 w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Ingredients" value={form.ingredients} onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))} />
      <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Key ingredients (comma separated)" value={form.keyIngredients} onChange={(e) => setForm((p) => ({ ...p, keyIngredients: e.target.value }))} />
      <div className="space-y-3 rounded-lg border border-admin-border bg-admin-elevated p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-admin-text-muted">Product media</p>
        {initial?.id ? (
          <>
            <div className="space-y-2">
              <p className="text-xs text-admin-text-secondary">Hero image</p>
              {heroPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroPreview} alt="Hero preview" className="h-36 w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-admin-border text-xs text-admin-text-muted">
                  No hero image yet
                </div>
              )}
              <label className="inline-flex cursor-pointer rounded-md border border-admin-border-strong bg-admin-panel px-3 py-1.5 text-xs text-admin-text-secondary hover:bg-white/5">
                {uploading === "hero" ? "Uploading..." : "Upload hero image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAsset("shop-product-hero", file);
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-admin-text-secondary">Gallery images</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {galleryPreview.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={index} src={url} alt={`Gallery ${index + 1}`} className="h-20 w-full rounded-md object-cover" />
                ))}
                {galleryPreview.length === 0 ? (
                  <div className="col-span-full flex h-20 items-center justify-center rounded-md border border-dashed border-admin-border text-xs text-admin-text-muted">
                    No gallery images yet
                  </div>
                ) : null}
              </div>
              <label className="inline-flex cursor-pointer rounded-md border border-admin-border-strong bg-admin-panel px-3 py-1.5 text-xs text-admin-text-secondary hover:bg-white/5">
                {uploading === "gallery" ? "Uploading..." : "Add gallery image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAsset("shop-product-image", file);
                  }}
                />
              </label>
            </div>
          </>
        ) : (
          <p className="text-xs text-admin-text-muted">Save the product first to enable image uploads.</p>
        )}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}

