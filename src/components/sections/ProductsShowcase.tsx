import Link from "next/link";
import Image from "next/image";

type ProductItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  imageUrl?: string | null;
};

export function ProductsShowcase({ products }: { products: ProductItem[] }) {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-black/40">Saco Supernature</p>
          <h2 className="mt-2 text-3xl font-bold text-black">Professional Hair Care</h2>
          <p className="mt-2 max-w-2xl text-sm text-black/60">
            Discover Lorraine&apos;s product range for revitalizing, hydrating, and color-protecting results.
          </p>
        </div>
        <Link href="/shop" className="rounded-xl bg-brand-graphite px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white">
          Shop all products
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} width={500} height={320} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 items-center justify-center bg-black/5 px-6 text-center text-xs uppercase tracking-[0.25em] text-black/35">
                  Product image coming soon
                </div>
              )}
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold text-black">{product.name}</h3>
                <p className="line-clamp-2 text-sm text-black/60">{product.shortDescription ?? "Professional hair care formula."}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-black">£{product.price.toFixed(2)}</p>
                  <Link href={`/shop/${product.slug}`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b67400]">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-12 text-center">
          <p className="text-sm text-black/65">Products are being refreshed right now. Visit the shop shortly for the full catalogue.</p>
        </div>
      )}
    </section>
  );
}

