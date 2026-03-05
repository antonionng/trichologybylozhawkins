"use client";

import { useShopCart } from "@/components/shop/CartProvider";
import Image from "next/image";

type ProductDetailProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    shortDescription?: string | null;
    price: number;
    perfectFor?: string | null;
    ingredients?: string | null;
    keyIngredients?: string[];
    imageUrl?: string | null;
  };
};

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useShopCart();

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} width={900} height={700} className="h-full w-full object-cover" />
        ) : (
          <div className="h-[420px] bg-black/5" />
        )}
      </div>

      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-black">{product.name}</h1>
        <p className="text-lg font-semibold text-black">£{product.price.toFixed(2)}</p>
        <p className="text-sm leading-relaxed text-black/65">
          {product.description ?? product.shortDescription ?? ""}
        </p>
        {product.perfectFor ? (
          <p className="text-sm text-black/70">
            <span className="font-semibold text-black">Perfect for:</span> {product.perfectFor}
          </p>
        ) : null}
        {product.keyIngredients && product.keyIngredients.length > 0 ? (
          <p className="text-sm text-black/70">
            <span className="font-semibold text-black">Key ingredients:</span>{" "}
            {product.keyIngredients.join(" | ")}
          </p>
        ) : null}
        {product.ingredients ? (
          <p className="text-sm text-black/70">
            <span className="font-semibold text-black">Ingredients:</span> {product.ingredients}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl ?? null,
            })
          }
          className="inline-flex rounded-xl bg-brand-graphite px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
        >
          Add to cart
        </button>
      </div>
    </section>
  );
}

