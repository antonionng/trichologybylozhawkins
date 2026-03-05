"use client";

import Link from "next/link";
import Image from "next/image";
import { useShopCart } from "@/components/shop/CartProvider";

export type ShopProductCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  imageUrl?: string | null;
};

export function ProductCard({ product }: { product: ShopProductCardData }) {
  const { addItem } = useShopCart();

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      {product.imageUrl ? (
        <Image src={product.imageUrl} alt={product.name} width={500} height={360} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-black/5" />
      )}
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-black">{product.name}</h3>
          <p className="text-sm text-black/60">{product.shortDescription ?? "Professional hair care formula."}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-black">£{product.price.toFixed(2)}</p>
          <button
            type="button"
            onClick={() =>
              addItem(
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl ?? null,
                },
                1,
              )
            }
            className="rounded-xl bg-brand-graphite px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Add
          </button>
        </div>
        <Link href={`/shop/${product.slug}`} className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b67400]">
          View product
        </Link>
      </div>
    </article>
  );
}

