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
  glass:
    "rounded-2xl border border-white/40 bg-white/85 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl",
  card:
    "rounded-2xl border border-black/5 bg-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.4)]",
  subtle: "rounded-2xl border border-black/5 bg-white/70",
};

const paddingClasses: Record<NonNullable<SurfaceProps["padding"]>, string> = {
  none: "",
  sm: "p-3 sm:p-5",
  md: "p-5 sm:p-7",
  lg: "p-7 sm:p-9",
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





