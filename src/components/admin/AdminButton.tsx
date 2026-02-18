"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  href?: string;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-admin-accent text-black font-semibold hover:bg-admin-accent-hover active:brightness-90",
  secondary:
    "bg-transparent border border-admin-border-strong text-admin-text hover:bg-white/5 active:bg-white/10",
  ghost:
    "bg-transparent text-admin-text-secondary hover:text-admin-text hover:bg-white/5",
  danger:
    "bg-admin-danger/10 border border-admin-danger/20 text-admin-danger hover:bg-admin-danger/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  md: "h-8 px-3 text-sm gap-2 rounded-md",
  lg: "h-10 px-4 text-sm gap-2 rounded-lg",
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  function AdminButton(
    {
      variant = "secondary",
      size = "md",
      children,
      href,
      loading,
      disabled,
      className,
      ...rest
    },
    ref
  ) {
    const classes = clsx(
      "inline-flex items-center justify-center font-medium transition-colors duration-150 whitespace-nowrap select-none",
      "disabled:opacity-40 disabled:pointer-events-none",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
