export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAdminShopProducts } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function ShopProductsPage() {
  const products = await getAdminShopProducts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shop Products"
        subtitle="Create, edit, publish, and archive products."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Products" },
        ]}
        actions={
          <Link href="/dashboard/shop/products/new" className="rounded-lg bg-admin-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black">
            + New Product
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-admin-panel text-admin-text-muted">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product.id} className="border-t border-admin-border">
                <td className="px-3 py-2 text-admin-text">
                  <p>{product.name}</p>
                  <p className="text-xs text-admin-text-muted">{product.slug}</p>
                </td>
                <td className="px-3 py-2 text-admin-text-muted">{product.status}</td>
                <td className="px-3 py-2 text-admin-text">£{Number(product.price).toFixed(2)}</td>
                <td className="px-3 py-2 text-admin-text-muted">{product.stockQuantity}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/shop/products/${product.id}/edit`} className="text-xs text-admin-accent">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-admin-text-muted">
                  No products created yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

