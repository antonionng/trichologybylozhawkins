"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { startShopCheckout } from "@/app/actions/shop";
import { useShopCart } from "@/components/shop/CartProvider";

type CustomerIdentity = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type SignupForm = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
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

const defaultSignup: SignupForm = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

type GuestStep = "choice" | "guest" | "signup";

const isIdentityComplete = (value: Partial<CustomerIdentity>) =>
  Boolean(value.email?.trim() && value.firstName?.trim() && value.lastName?.trim());

export function CartPageClient({ initialCheckout }: { initialCheckout?: CartCheckoutInitialState }) {
  const { items, subtotal, updateQuantity, removeItem } = useShopCart();
  const [identity, setIdentity] = useState<CustomerIdentity>({
    ...defaultIdentity,
    ...initialCheckout?.customer,
    phone: initialCheckout?.customer?.phone ?? "",
  });
  const [guestStep, setGuestStep] = useState<GuestStep>("choice");
  const [signup, setSignup] = useState<SignupForm>({
    ...defaultSignup,
    email: initialCheckout?.customer?.email ?? "",
    firstName: initialCheckout?.customer?.firstName ?? "",
    lastName: initialCheckout?.customer?.lastName ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = Boolean(initialCheckout?.isAuthenticated);

  const loginHref = "/login?next=%2Fshop%2Fcart";
  const showIdentityForm = !isAuthenticated && guestStep === "guest";

  const checkoutLabel = useMemo(
    () => (isAuthenticated ? "Continue to secure checkout" : "Proceed to secure checkout"),
    [isAuthenticated],
  );

  const onCheckout = async (customerOverride?: Partial<CustomerIdentity>) => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const resolvedIdentity = {
      ...identity,
      ...customerOverride,
    };

    if (!isIdentityComplete(resolvedIdentity)) {
      setError("Please add your name and email before checkout.");
      return;
    }

    setLoading(true);
    try {
      const base = window.location.origin;
      await startShopCheckout({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customer: {
          email: resolvedIdentity.email.trim(),
          firstName: resolvedIdentity.firstName.trim(),
          lastName: resolvedIdentity.lastName.trim(),
          phone: resolvedIdentity.phone.trim() || undefined,
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

  const onSignupAndCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setSignupLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to create account.");
      }
      const createdIdentity = {
        email: signup.email,
        firstName: signup.firstName,
        lastName: signup.lastName || signup.firstName,
        phone: "",
      };
      setIdentity(createdIdentity);
      await onCheckout(createdIdentity);
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSignupLoading(false);
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
          <>
            <div className="rounded-2xl border border-brand-graphite/10 bg-brand-ivory/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-graphite/45">Checkout options</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={loginHref} className="inline-flex items-center rounded-xl border border-brand-graphite/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-graphite hover:bg-brand-sand/60">
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => setGuestStep("signup")}
                  className="inline-flex items-center rounded-xl border border-brand-graphite/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-graphite hover:bg-brand-sand/60"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setGuestStep("guest")}
                  className="inline-flex items-center rounded-xl bg-brand-graphite px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ivory hover:bg-brand-night"
                >
                  Continue as guest
                </button>
              </div>
            </div>
            {guestStep === "signup" ? (
              <form onSubmit={onSignupAndCheckout} className="grid gap-3">
                <input
                  value={signup.firstName}
                  onChange={(event) => setSignup((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="First name"
                  className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
                  required
                />
                <input
                  value={signup.lastName}
                  onChange={(event) => setSignup((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Last name"
                  className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
                />
                <input
                  value={signup.email}
                  onChange={(event) => setSignup((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  type="email"
                  className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
                  required
                />
                <input
                  value={signup.password}
                  onChange={(event) => setSignup((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password (min 8 characters)"
                  type="password"
                  minLength={8}
                  className="rounded-xl border border-brand-graphite/15 bg-brand-ivory/40 px-3 py-2 text-sm text-brand-graphite placeholder:text-brand-graphite/45 focus:border-brand-graphite/30 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={signupLoading || loading}
                  className="w-full rounded-xl bg-brand-graphite px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-ivory transition hover:bg-brand-night disabled:opacity-60"
                >
                  {signupLoading ? "Creating account..." : "Create account & checkout"}
                </button>
              </form>
            ) : null}
          </>
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
          disabled={loading || signupLoading}
          className="w-full rounded-xl bg-brand-graphite px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-ivory transition hover:bg-brand-night disabled:opacity-60"
        >
          {loading ? "Processing..." : checkoutLabel}
        </button>
      </section>
    </div>
  );
}

