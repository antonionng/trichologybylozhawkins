"use client";

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import clsx from "clsx";

/* ───────── Types ───────── */

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ───────── Context ───────── */

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

/* ───────── Provider ───────── */

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idCounter;
    setItems((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {items.map((item) => (
          <ToastBubble
            key={item.id}
            item={item}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ───────── Bubble ───────── */

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-500/20 text-emerald-400",
  error: "border-red-500/20 text-red-400",
  info: "border-blue-500/20 text-blue-400",
};

function ToastBubble({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-center gap-2 rounded-lg border bg-admin-elevated px-4 py-2.5 text-sm shadow-lg",
        "animate-in slide-in-from-right-5 fade-in duration-200",
        variantClasses[item.variant]
      )}
    >
      {item.variant === "success" && <span>✓</span>}
      {item.variant === "error" && <span>✕</span>}
      {item.variant === "info" && <span>ℹ</span>}
      <span className="text-admin-text">{item.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-admin-text-muted hover:text-admin-text transition-colors"
      >
        ×
      </button>
    </div>
  );
}
