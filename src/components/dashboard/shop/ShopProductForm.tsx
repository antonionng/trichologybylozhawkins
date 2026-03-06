"use client";

import React, { useState } from "react";
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
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [uploading, setUploading] = useState<null | "hero" | "gallery">(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [conceptPrompt, setConceptPrompt] = useState("");
  const [currentProductId, setCurrentProductId] = useState<string | null>(initial?.id ?? null);
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

  const isWizardMode = !initial?.id;

  const toPayload = (value: typeof form) => ({
    name: value.name,
    slug: value.slug,
    shortDescription: value.shortDescription,
    description: value.description,
    categoryId: value.categoryId || null,
    price: Number(value.price || 0),
    compareAtPrice: value.compareAtPrice ? Number(value.compareAtPrice) : null,
    sku: value.sku || undefined,
    stockQuantity: Number(value.stockQuantity || 0),
    status: value.status,
    perfectFor: value.perfectFor || undefined,
    ingredients: value.ingredients || undefined,
    keyIngredients: value.keyIngredients
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
    heroMediaId,
    imageMediaIds,
  });

  const saveProduct = async (value: typeof form) => {
    const payload = toPayload(value);
    const endpoint = currentProductId
      ? `/api/shop/products/${currentProductId}`
      : "/api/shop/products";
    const method = currentProductId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? "Failed to save product");
    if (!currentProductId && data?.id) {
      setCurrentProductId(data.id);
    }
    return data;
  };

  const handleGenerateDraft = async () => {
    if (!conceptPrompt.trim()) {
      setError("Please enter a product concept first.");
      return;
    }
    setError(null);
    setGeneratingDraft(true);
    try {
      const response = await fetch("/api/ai/shop-product-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: conceptPrompt.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Failed to generate AI draft.");

      const draft = payload?.draft ?? {};
      const nextForm = {
        ...form,
        name: draft.name ?? form.name,
        slug: draft.slug ?? form.slug,
        shortDescription: draft.shortDescription ?? form.shortDescription,
        description: draft.description ?? form.description,
        perfectFor: draft.perfectFor ?? form.perfectFor,
        ingredients: draft.ingredients ?? form.ingredients,
        keyIngredients: Array.isArray(draft.keyIngredients)
          ? draft.keyIngredients.join(", ")
          : form.keyIngredients,
        price: draft.priceSuggestion ? String(draft.priceSuggestion) : form.price,
        status: "DRAFT",
      };

      setForm(nextForm);
      await saveProduct(nextForm);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft.");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleStepNext = async () => {
    if (step >= 5) return;
    setError(null);
    setLoading(true);
    try {
      await saveProduct(form);
      setStep((prev) => Math.min(5, prev + 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepBack = () => setStep((prev) => Math.max(1, prev - 1));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await saveProduct(form);
      router.push("/dashboard/shop/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (kind: "shop-product-hero" | "shop-product-image", file: File) => {
    if (!currentProductId) {
      setError("Save this product first, then upload images.");
      return;
    }
    setError(null);
    setUploading(kind === "shop-product-hero" ? "hero" : "gallery");
    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("shopProductId", currentProductId);
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

  if (isWizardMode) {
    return (
      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-admin-border bg-admin-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-admin-text-muted">New product wizard</p>
            <h2 className="text-xl font-semibold text-admin-text">Step {step} of 5</h2>
          </div>
          <div className="text-xs text-admin-text-muted">
            {currentProductId ? "Draft saved" : "Not saved yet"}
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4 rounded-xl border border-admin-border bg-admin-elevated p-4">
            <p className="text-sm font-medium text-admin-text">Product concept</p>
            <textarea
              value={conceptPrompt}
              onChange={(event) => setConceptPrompt(event.target.value)}
              placeholder="Describe the product, target customer, concerns, texture and outcomes..."
              className="h-32 w-full rounded-lg border border-admin-border bg-admin-panel px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generatingDraft}
              className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {generatingDraft ? "Generating..." : "Generate AI Draft"}
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
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
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
            <textarea className="h-28 w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Perfect for" value={form.perfectFor} onChange={(e) => setForm((p) => ({ ...p, perfectFor: e.target.value }))} />
            <textarea className="h-24 w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Ingredients" value={form.ingredients} onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))} />
            <input className="w-full rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Key ingredients (comma separated)" value={form.keyIngredients} onChange={(e) => setForm((p) => ({ ...p, keyIngredients: e.target.value }))} />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Compare-at price" value={form.compareAtPrice} onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))} />
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
            <input className="rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Stock quantity" value={form.stockQuantity} onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3 rounded-lg border border-admin-border bg-admin-elevated p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-admin-text-muted">Product media</p>
            {currentProductId ? (
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
              <p className="text-xs text-admin-text-muted">Generate and save draft first to enable uploads.</p>
            )}
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleStepBack}
            disabled={step === 1 || loading || generatingDraft}
            className="rounded-lg border border-admin-border px-4 py-2 text-sm text-admin-text-secondary disabled:opacity-50"
          >
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={handleStepNext}
              disabled={loading || generatingDraft || (step === 1 && !currentProductId)}
              className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Saving..." : "Next"}
            </button>
          ) : (
            <button type="submit" disabled={loading || generatingDraft} className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
              {loading ? "Saving..." : "Save Product"}
            </button>
          )}
        </div>
      </form>
    );
  }

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
        {currentProductId ? (
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

