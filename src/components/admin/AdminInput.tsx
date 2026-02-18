"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import clsx from "clsx";

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  suffix?: ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  function AdminInput(
    { label, description, error, suffix, className, ...rest },
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
        <div className="relative">
          <input
            ref={ref}
            className={clsx(
              "block w-full rounded-md border bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-admin-accent/40 focus:border-admin-accent/50",
              "transition-colors duration-150",
              error
                ? "border-admin-danger/50"
                : "border-admin-border-strong",
              suffix ? "pr-10" : "",
              className
            )}
            {...rest}
          />
          {suffix ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-admin-text-muted">
              {suffix}
            </div>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs text-admin-danger">{error}</p>
        ) : null}
      </div>
    );
  }
);
