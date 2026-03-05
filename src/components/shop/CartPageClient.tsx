"use client";

import { useState } from "react";
import { useShopCart } from "@/components/shop/CartProvider";

type CheckoutForm = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const defaultForm: CheckoutForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "GB",
};

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem } = useShopCart();
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async () => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    try {
      const base = window.location.origin;
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          customer: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone || undefined,
          },
          shippingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state || undefined,
            postalCode: form.postalCode,
            country: form.country,
          },
          billingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state || undefined,
            postalCode: form.postalCode,
            country: form.country,
          },
          successUrl: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${base}/shop/cart`,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Checkout failed");
      }
      if (!payload.url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-black">Your Cart</h1>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-black/60">
            Your cart is empty.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-black">{item.name}</p>
                  <p className="text-sm text-black/60">£{item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-xs text-red-600">
                  Remove
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                  -
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Checkout</h2>
        <div className="grid gap-3">
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              value={value}
              onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={key}
              className="rounded-xl border border-black/15 px-3 py-2 text-sm"
            />
          ))}
        </div>
        <p className="text-sm">Subtotal: <strong>£{subtotal.toFixed(2)}</strong></p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-brand-graphite px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
        >
          {loading ? "Processing..." : "Proceed to checkout"}
        </button>
      </section>
    </div>
  );
}

