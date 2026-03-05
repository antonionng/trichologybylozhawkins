"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ShopOrderStatusForm({
  orderId,
  currentStatus,
  trackingNumber,
  trackingUrl,
}: {
  orderId: string;
  currentStatus: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNo, setTrackingNo] = useState(trackingNumber ?? "");
  const [trackingLink, setTrackingLink] = useState(trackingUrl ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/shop/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNo || undefined,
          trackingUrl: trackingLink || undefined,
          note: note || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Failed to update order");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-admin-border bg-admin-panel p-4">
      <h3 className="text-sm font-semibold text-admin-text">Update order</h3>
      <select className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="REFUNDED">Refunded</option>
      </select>
      <input className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Tracking number" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
      <input className="w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Tracking URL" value={trackingLink} onChange={(e) => setTrackingLink(e.target.value)} />
      <textarea className="h-20 w-full rounded-md border border-admin-border bg-admin-elevated px-3 py-2 text-sm" placeholder="Internal note" value={note} onChange={(e) => setNote(e.target.value)} />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-md bg-admin-accent px-3 py-2 text-xs font-semibold text-black disabled:opacity-60">
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

