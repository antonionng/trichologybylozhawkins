import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { getProductBySlug } from "@/server/modules/shop/service";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

async function resolveImage(product: any) {
  if (product.heroMedia?.path) {
    try {
      return await createSignedDownloadUrl(product.heroMedia.path);
    } catch {
      // ignore
    }
  }
  const firstImagePath = product.images?.[0]?.media?.path;
  if (firstImagePath) {
    try {
      return await createSignedDownloadUrl(firstImagePath);
    } catch {
      // ignore
    }
  }
  return (product.meta as any)?.image ?? null;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  const imageUrl = await resolveImage(product);
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10 lg:px-12">
      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: Number(product.price),
          perfectFor: product.perfectFor,
          ingredients: product.ingredients,
          keyIngredients: product.keyIngredients,
          imageUrl,
        }}
      />
    </main>
  );
}

