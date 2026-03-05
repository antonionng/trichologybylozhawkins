import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export function CategoryFilter({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/shop"
        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          !active ? "bg-brand-graphite text-white" : "bg-black/5 text-black/70"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            active === category.slug ? "bg-brand-graphite text-white" : "bg-black/5 text-black/70"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

