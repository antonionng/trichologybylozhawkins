"use client";

import { ReactNode, useEffect, useRef } from "react";
import clsx from "clsx";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AdminModal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: AdminModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={clsx(
          "relative w-full max-w-md rounded-xl border border-admin-border-strong bg-admin-panel shadow-2xl",
          className
        )}
      >
        {title ? (
          <div className="border-b border-admin-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-admin-border px-5 py-3 flex items-center justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
