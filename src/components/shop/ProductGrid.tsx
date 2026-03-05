import { ProductCard, ShopProductCardData } from "@/components/shop/ProductCard";

export function ProductGrid({ products }: { products: ShopProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-black/60">
        No products found for this filter.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

