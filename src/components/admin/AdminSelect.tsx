"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  function AdminSelect(
    { label, description, error, options, placeholder, className, ...rest },
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
        <select
          ref={ref}
          className={clsx(
            "block w-full rounded-md border bg-admin-elevated px-3 py-2 text-sm text-admin-text",
            "focus:outline-none focus:ring-2 focus:ring-admin-accent/40 focus:border-admin-accent/50",
            "transition-colors duration-150 appearance-none",
            "bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23a1a1aa%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.22%208.22a.75.75%200%20011.06%200L10%2011.94l3.72-3.72a.75.75%200%20111.06%201.06l-4.25%204.25a.75.75%200%2001-1.06%200L5.22%209.28a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E')]",
            error
              ? "border-admin-danger/50"
              : "border-admin-border-strong",
            className
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" className="text-admin-text-muted">
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-admin-danger">{error}</p>
        ) : null}
      </div>
    );
  }
);
