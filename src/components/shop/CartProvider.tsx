"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lh_shop_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      subtotal,
      itemCount,
      addItem(item, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((line) => line.productId === item.productId);
          if (!existing) return [...prev, { ...item, quantity }];
          return prev.map((line) =>
            line.productId === item.productId
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          );
        });
        setIsOpen(true);
      },
      removeItem(productId) {
        setItems((prev) => prev.filter((line) => line.productId !== productId));
      },
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          setItems((prev) => prev.filter((line) => line.productId !== productId));
          return;
        }
        setItems((prev) =>
          prev.map((line) =>
            line.productId === productId ? { ...line, quantity } : line,
          ),
        );
      },
      clear() {
        setItems([]);
      },
      open() {
        setIsOpen(true);
      },
      close() {
        setIsOpen(false);
      },
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useShopCart must be used within CartProvider.");
  }
  return context;
}

