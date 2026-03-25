import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { getProductBySlug } from "@/server/modules/shop/service";
import { createSignedDownloadUrl, getPublicUrl } from "@/server/storage/supabase";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProductJsonLd,
} from "@/lib/seo";

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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product || product.status !== "PUBLISHED") {
    return buildPageMetadata({
      path: `/shop/${params.slug}`,
      title: "Product not found",
      description: "The requested product could not be found.",
      noIndex: true,
    });
  }

  const imageUrl = await resolveImage(product);

  return buildPageMetadata({
    path: `/shop/${params.slug}`,
    title: product.name,
    description:
      product.shortDescription ||
      product.description ||
      "Scalp care and hair health support from Lorraine Hawkins.",
    imagePath: imageUrl || undefined,
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  const imageUrl = await resolveImage(product);
  return (
    <>
      <JsonLd
        data={buildProductJsonLd({
          path: `/shop/${params.slug}`,
          name: product.name,
          description:
            product.shortDescription ||
            product.description ||
            "Scalp care and hair health support from Lorraine Hawkins.",
          image: imageUrl,
          price: Number(product.price),
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(`/shop/${params.slug}`, [
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/shop/${params.slug}` },
        ])}
      />
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
    </>
  );
}

