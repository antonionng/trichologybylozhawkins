'use client';

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-graphite text-brand-ivory hover:bg-brand-graphite/90 active:bg-brand-graphite/80 focus-visible:outline-brand-salmon",
  secondary:
    "bg-brand-salmon text-brand-ivory hover:bg-brand-salmon/90 active:bg-brand-salmon/80 focus-visible:outline-brand-graphite",
  ghost:
    "border border-brand-graphite/20 text-brand-graphite hover:border-brand-graphite/40 hover:bg-brand-mist/60 focus-visible:outline-brand-salmon",
  link: "text-brand-graphite underline decoration-brand-salmon/50 underline-offset-4 hover:decoration-brand-salmon",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs uppercase tracking-[0.28em]",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  textured?: boolean;
};

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonLinkProps = BaseProps &
  React.ComponentProps<typeof Link> & {
    href: string;
  };

function renderChildren(children: ReactNode, icon?: ReactNode, position: "left" | "right" = "right") {
  if (!icon) return children;
  return (
    <span className="flex items-center gap-2">
      {position === "left" ? icon : null}
      <span>{children}</span>
      {position === "right" ? icon : null}
    </span>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  textured,
  className,
  children,
  icon,
  iconPosition = "right",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        textured && variant !== "secondary" && "texture-linen shadow-soft-top",
        className,
      )}
      {...rest}
    >
      {renderChildren(children, icon, iconPosition)}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  textured,
  className,
  children,
  icon,
  iconPosition = "right",
  ...rest
}: ButtonLinkProps) {
  if (variant === "link") {
    return (
      <Link
        className={clsx(
          "inline-flex items-center font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-salmon",
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {renderChildren(children, icon, iconPosition)}
      </Link>
    );
  }

  return (
    <Link
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        textured && variant !== "secondary" && "texture-linen shadow-soft-top",
        className,
      )}
      {...rest}
    >
      {renderChildren(children, icon, iconPosition)}
    </Link>
  );
}

