import type { ReactNode } from "react";
import clsx from "clsx";

type SurfaceVariant = "glass" | "card" | "subtle";

type SurfaceProps = {
  as?: keyof JSX.IntrinsicElements;
  variant?: SurfaceVariant;
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  texture?: "linen" | "veined";
};

const variantClasses: Record<SurfaceVariant, string> = {
  glass: "glass-panel",
  card: "rounded-glass-md bg-white border border-brand-graphite/10 shadow-card",
  subtle: "rounded-glass-md bg-brand-ivory border border-brand-graphite/5",
};

const paddingClasses: Record<NonNullable<SurfaceProps["padding"]>, string> = {
  none: "",
  sm: "p-4 sm:p-6",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

export function Surface({
  as: Tag = "div",
  variant = "card",
  children,
  className,
  padding = "md",
  texture,
}: SurfaceProps) {
  return (
    <Tag
      className={clsx(
        variantClasses[variant],
        paddingClasses[padding],
        texture === "linen" && "texture-linen",
        texture === "veined" && "texture-veined",
        className,
      )}
    >
      {children}
    </Tag>
  );
}





