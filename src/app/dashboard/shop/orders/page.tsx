import Link from "next/link";
import { getAdminOrders } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function ShopOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shop Orders"
        subtitle="Track new orders and update fulfillment statuses."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Orders" },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-admin-panel text-admin-text-muted">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-t border-admin-border">
                <td className="px-3 py-2">
                  <Link href={`/dashboard/shop/orders/${order.id}`} className="text-admin-text hover:text-admin-accent">
                    {order.firstName} {order.lastName}
                  </Link>
                  <p className="text-xs text-admin-text-muted">{order.email}</p>
                </td>
                <td className="px-3 py-2 text-admin-text-muted">{order.status}</td>
                <td className="px-3 py-2 text-admin-text">£{Number(order.totalAmount).toFixed(2)}</td>
                <td className="px-3 py-2 text-admin-text-muted">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-admin-text-muted" colSpan={4}>
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

