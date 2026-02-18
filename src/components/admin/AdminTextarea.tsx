"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface AdminTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const AdminTextarea = forwardRef<
  HTMLTextAreaElement,
  AdminTextareaProps
>(function AdminTextarea(
  { label, description, error, className, rows = 4, ...rest },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="block text-xs font-medium text-admin-text-secondary">
          {label}
        </label>
      ) : null}
      {description ? (
        <p className="text-xs text-admin-text-muted">{description}</p>
      ) : null}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          "block w-full rounded-md border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-admin-accent/40 focus:border-admin-accent/50",
          "transition-colors duration-150 resize-y",
          error
            ? "border-admin-danger/50"
            : "border-admin-border-strong",
          className
        )}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-admin-danger">{error}</p>
      ) : null}
    </div>
  );
});
