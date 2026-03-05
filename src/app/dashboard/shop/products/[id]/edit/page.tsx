import { notFound } from "next/navigation";
import { requireUserOrRedirect } from "@/server/security/auth";
import { getProductById } from "@/server/modules/shop/service";
import { getAdminShopCategories } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShopProductForm } from "@/components/dashboard/shop/ShopProductForm";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export default async function EditShopProductPage({ params }: { params: { id: string } }) {
  await requireUserOrRedirect({ role: "ADMIN", next: `/dashboard/shop/products/${params.id}/edit` });
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getAdminShopCategories(),
  ]);
  if (!product) notFound();

  let heroUrl: string | null = null;
  if (product.heroMedia?.path) {
    try {
      heroUrl = await createSignedDownloadUrl(product.heroMedia.path);
    } catch {
      // ignore
    }
  }
  const galleryUrls = await Promise.all(
    (product.images ?? []).map(async (image: any) => {
      if (!image.media?.path) return null;
      try {
        return await createSignedDownloadUrl(image.media.path);
      } catch {
        return null;
      }
    }),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Product"
        subtitle="Update product details, pricing, and stock."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Products", href: "/dashboard/shop/products" },
          { label: product.name },
        ]}
      />
      <ShopProductForm
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          categoryId: product.categoryId,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
          status: product.status,
          perfectFor: product.perfectFor,
          ingredients: product.ingredients,
          keyIngredients: product.keyIngredients,
          heroMediaId: product.heroMediaId ?? null,
          imageMediaIds: (product.images ?? []).map((image: any) => image.mediaId),
          heroUrl,
          galleryUrls: galleryUrls.filter(Boolean) as string[],
        }}
      />
    </div>
  );
}

