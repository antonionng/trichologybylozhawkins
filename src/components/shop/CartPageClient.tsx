"use client";

import React, { useState } from "react";
import { startShopCheckout } from "@/app/actions/shop";
import { useShopCart } from "@/components/shop/CartProvider";

type CustomerIdentity = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type CartCheckoutInitialState = {
  isAuthenticated: boolean;
  contactId?: string;
  customer?: Partial<CustomerIdentity>;
};

const defaultIdentity: CustomerIdentity = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

const getMissingIdentityFields = (value: Partial<CustomerIdentity>) => {
  const missing: string[] = [];
  if (!value.email?.trim()) missing.push("email address");
  if (!value.firstName?.trim()) missing.push("first name");
  if (!value.lastName?.trim()) missing.push("last name");
  return missing;
};

const formatMissingFieldsMessage = (missingFields: string[]) => {
  if (missingFields.length === 0) return null;
  if (missingFields.length === 1) {
    return `Please add your ${missingFields[0]} before checkout.`;
  }
  if (missingFields.length === 2) {
    return `Please add your ${missingFields[0]} and ${missingFields[1]} before checkout.`;
  }

  return `Please add your ${missingFields[0]}, ${missingFields[1]}, and ${missingFields[2]} before checkout.`;
};

export function CartPageClient({ initialCheckout }: { initialCheckout?: CartCheckoutInitialState }) {
  const { items, subtotal, updateQuantity, removeItem } = useShopCart();
  const [identity, setIdentity] = useState<CustomerIdentity>({
    ...defaultIdentity,
    ...initialCheckout?.customer,
    phone: initialCheckout?.customer?.phone ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = Boolean(initialCheckout?.isAuthenticated);
  const showIdentityForm = getMissingIdentityFields(identity).length > 0;

  const onCheckout = async () => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const missingFields = getMissingIdentityFields(identity);
    const missingFieldsMessage = formatMissingFieldsMessage(missingFields);
    if (missingFieldsMessage) {
      setError(missingFieldsMessage);
      return;
    }

    setLoading(true);
    try {
      const base = window.location.origin;
      await startShopCheckout({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customer: {
          email: identity.email.trim(),
          firstName: identity.firstName.trim(),
          lastName: identity.lastName.trim(),
          phone: identity.phone.trim() || undefined,
        },
        contactId: initialCheckout?.contactId,
        successUrl: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${base}/shop/cart`,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 rounded-3xl border border-brand-graphite/10 bg-brand-ivory/70 p-6 shadow-soft-top lg:grid-cols-[1.2fr_1fr] lg:p-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-brand-graphite">Your Cart</h1>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-graphite/20 bg-brand-sand/60 p-6 text-sm text-brand-graphite/60">
            Your cart is empty.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="rounded-2xl border border-brand-graphite/10 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-graphite">{item.name}</p>
                  <p className="text-sm text-brand-graphite/60">£{item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-salmon hover:text-brand-graphite"
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-graphite/10 bg-brand-ivory px-2 py-1">
                <button
                  className="h-8 w-8 rounded-full border border-brand-graphite/15 bg-white text-brand-graphite transition-colors hover:bg-brand-sand"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium text-brand-graphite">{item.quantity}</span>
                <button
                  className="h-8 w-8 rounded-full border border-brand-graphite/15 bg-white text-brand-graphite transition-colors hover:bg-brand-sand"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-brand-graphite/10 bg-white/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-graphite">Checkout</h2>
        {isAuthenticated ? (
          <div className="rounded-2xl border border-brand-graphite/10 bg-brand-ivory/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-graphite/45">Signed in</p>
            <p className="mt-2 text-sm font-semibold text-brand-graphite">{identity.firstName} {identity.lastName}</p>
            <p className="text-sm text-brand-graphite/65">{identity.email}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-graphite/10 bg-brand-ivory/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-graphite/45">Secure checkout</p>
            <p className="mt-2 text-sm text-brand-graphite/65">
              Enter your details once, then complete payment securely on Stripe.
            </p>
          </div>
        )}

        {showIdentityForm ? (
          <div className="grid gap-3">
            <input
              value={identity.email}
              onChange={(event) => setIdentity((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
              type="email"
              required
            />
            <input
              value={identity.firstName}
              onChange={(event) => setIdentity((prev) => ({ ...prev, firstName: event.target.value }))}
              placeholder="First name"
              className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
              required
            />
            <input
              value={identity.lastName}
              onChange={(event) => setIdentity((prev) => ({ ...prev, lastName: event.target.value }))}
              placeholder="Last name"
              className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
              required
            />
            <input
              value={identity.phone}
              onChange={(event) => setIdentity((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone (optional)"
              className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
            />
            {!isAuthenticated ? (
              <p className="text-xs text-brand-graphite/55">
                No account needed. We only need these details so Stripe can complete your order.
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="text-sm text-brand-graphite/70">
          Subtotal: <strong className="text-base text-brand-graphite">£{subtotal.toFixed(2)}</strong>
        </p>
        <p className="text-xs text-brand-graphite/55">
          Shipping address and card details are collected securely on Stripe.
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-brand-graphite px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-ivory transition hover:bg-brand-night disabled:opacity-60"
        >
          {loading ? "Processing..." : "Continue to secure checkout"}
        </button>
      </section>
    </div>
  );
}

