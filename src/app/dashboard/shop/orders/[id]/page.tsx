import { notFound } from "next/navigation";
import { getAdminOrder } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShopOrderStatusForm } from "@/components/dashboard/shop/ShopOrderStatusForm";

export default async function ShopOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getAdminOrder(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order ${order.id.slice(0, 8)}`}
        subtitle="Update shipping, tracking, and lifecycle status."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Orders", href: "/dashboard/shop/orders" },
          { label: order.id.slice(0, 8) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4 rounded-2xl border border-admin-border bg-admin-panel p-5">
          <h2 className="text-sm font-semibold text-admin-text">Items</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-admin-border bg-admin-elevated p-3">
                <p className="text-sm font-medium text-admin-text">{item.productName}</p>
                <p className="text-xs text-admin-text-muted">
                  Qty {item.quantity} · £{Number(item.unitPrice).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-admin-border bg-admin-elevated p-3 text-sm text-admin-text-muted">
            <p>
              Customer: <span className="text-admin-text">{order.firstName} {order.lastName}</span>
            </p>
            <p>Email: {order.email}</p>
            <p>Total: £{Number(order.totalAmount).toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-admin-border bg-admin-elevated p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-admin-text-muted">Timeline</h3>
            <div className="space-y-2">
              {order.events.map((event: any) => (
                <div key={event.id} className="text-xs text-admin-text-muted">
                  <p className="font-medium text-admin-text">{event.type}</p>
                  <p>{event.description ?? "Order updated."}</p>
                  <p>{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {order.events.length === 0 ? (
                <p className="text-xs text-admin-text-muted">No events recorded yet.</p>
              ) : null}
            </div>
          </div>
        </section>

        <ShopOrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          trackingNumber={order.trackingNumber}
          trackingUrl={order.trackingUrl}
        />
      </div>
    </div>
  );
}

