"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShopCart } from "@/components/shop/CartProvider";

export function CartDrawer() {
  const pathname = usePathname();
  const { items, itemCount, subtotal, isOpen, close, updateQuantity, removeItem } = useShopCart();

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={close}
            aria-label="Close cart"
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-brand-graphite/10 bg-brand-ivory shadow-card">
            <div className="flex items-center justify-between border-b border-brand-graphite/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-graphite">Your Cart</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-graphite/45">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <button type="button" onClick={close} className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite">
                Close
              </button>
            </div>
            <div className="h-[calc(100%-184px)] overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-brand-graphite/20 bg-brand-sand/70 p-4 text-sm text-brand-graphite/65">
                  Your cart is empty.
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="rounded-2xl border border-brand-graphite/10 bg-white/70 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-brand-graphite">{item.name}</p>
                          <p className="text-sm text-brand-graphite/60">£{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-salmon hover:text-brand-graphite"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-graphite/10 bg-brand-ivory px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-8 w-8 rounded-full border border-brand-graphite/15 bg-white text-brand-graphite transition-colors hover:bg-brand-sand"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-brand-graphite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-8 w-8 rounded-full border border-brand-graphite/15 bg-white text-brand-graphite transition-colors hover:bg-brand-sand"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-brand-graphite/10 bg-white/60 p-5">
              <p className="mb-3 text-sm text-brand-graphite/70">
                Subtotal: <strong className="text-base text-brand-graphite">£{subtotal.toFixed(2)}</strong>
              </p>
              <Link
                href="/shop/cart"
                onClick={close}
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-graphite px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-ivory transition hover:bg-brand-night"
              >
                Review full cart
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

