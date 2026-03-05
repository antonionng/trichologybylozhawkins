export const dynamic = "force-dynamic";

import Link from "next/link";
import { getShopStats } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetric } from "@/components/admin/AdminMetric";

export default async function ShopDashboardPage() {
  const stats = await getShopStats();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shop"
        subtitle="Manage Saco Supernature products, categories, and orders."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shop" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric label="Total products" value={stats.totals.products} />
        <AdminMetric label="Published products" value={stats.totals.productsPublished} />
        <AdminMetric label="Orders" value={stats.totals.orders} />
        <AdminMetric label="Revenue" value={`£${stats.totals.revenue.toFixed(2)}`} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-admin-border">
        <div className="flex items-center justify-between border-b border-admin-border bg-admin-panel px-4 py-3">
          <h2 className="text-sm font-semibold text-admin-text">Recent orders</h2>
          <Link href="/dashboard/shop/orders" className="text-xs uppercase tracking-[0.2em] text-admin-accent">
            View all
          </Link>
        </div>
        <div className="divide-y divide-admin-border">
          {stats.recentOrders.map((order: any) => (
            <Link
              key={order.id}
              href={`/dashboard/shop/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-white/[0.03]"
            >
              <div>
                <p className="text-admin-text">{order.firstName} {order.lastName}</p>
                <p className="text-xs text-admin-text-muted">{order.email}</p>
              </div>
              <div className="text-right">
                <p className="text-admin-text">£{Number(order.totalAmount).toFixed(2)}</p>
                <p className="text-xs text-admin-text-muted">{order.status}</p>
              </div>
            </Link>
          ))}
          {stats.recentOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-admin-text-muted">No orders yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

