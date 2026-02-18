import { ReactNode } from "react";
import clsx from "clsx";

type PanelVariant = "default" | "elevated" | "ghost";
type PanelPadding = "none" | "sm" | "md" | "lg";

interface PanelProps {
  children: ReactNode;
  variant?: PanelVariant;
  padding?: PanelPadding;
  className?: string;
}

const variantStyles: Record<PanelVariant, string> = {
  default: "bg-admin-panel border border-admin-border",
  elevated: "bg-admin-elevated border border-admin-border-strong",
  ghost: "bg-transparent",
};

const paddingStyles: Record<PanelPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Panel({
  children,
  variant = "default",
  padding = "md",
  className,
}: PanelProps) {
  return (
    <div
      className={clsx(
        "rounded-lg",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
