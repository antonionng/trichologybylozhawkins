"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShopCart } from "@/components/shop/CartProvider";

export function CartDrawer() {
  const pathname = usePathname();
  const { items, itemCount, subtotal, isOpen, open, close, updateQuantity, removeItem } = useShopCart();

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-brand-graphite px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        Cart ({itemCount})
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={close}
            aria-label="Close cart"
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button type="button" onClick={close} className="text-sm text-black/60">
                Close
              </button>
            </div>
            <div className="h-[calc(100%-152px)] overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="text-sm text-black/60">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-black/60">£{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-8 w-8 rounded border"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-8 w-8 rounded border"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <p className="mb-3 text-sm">Subtotal: <strong>£{subtotal.toFixed(2)}</strong></p>
              <Link
                href="/shop/cart"
                onClick={close}
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-graphite px-4 py-2.5 text-sm font-semibold text-white"
              >
                View Cart
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

