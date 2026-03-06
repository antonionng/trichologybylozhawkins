import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopHero } from "@/components/shop/ShopHero";
import { listCategories, listPublishedProducts } from "@/server/modules/shop/service";
import { createSignedDownloadUrl, getPublicUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

async function resolveImage(product: any) {
  const tryPath = (path: string) =>
    createSignedDownloadUrl(path).catch(() => getPublicUrl(path));

  if (product.heroMedia?.path) {
    try {
      return await tryPath(product.heroMedia.path);
    } catch {
      // ignore
    }
  }
  const firstImagePath = product.images?.[0]?.media?.path;
  if (firstImagePath) {
    try {
      return await tryPath(firstImagePath);
    } catch {
      // ignore
    }
  }
  return (product.meta as any)?.image ?? null;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const categorySlug = searchParams?.category;
  const [categories, products] = await Promise.all([
    listCategories(),
    listPublishedProducts({ categorySlug, limit: 60 }),
  ]);

  const cards = await Promise.all(
    products.map(async (product: any) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      imageUrl: await resolveImage(product),
    })),
  );

  return (
    <main className="mx-auto max-w-[1180px] space-y-8 px-6 py-10 sm:px-10 lg:px-12">
      <ShopHero />
      <CategoryFilter
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }))}
        active={categorySlug}
      />
      <ProductGrid products={cards} />
    </main>
  );
}

