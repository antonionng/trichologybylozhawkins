import clsx from "clsx";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-white/5 text-admin-text-secondary border-admin-border-strong",
  success:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger:
    "bg-red-500/10 text-red-400 border-red-500/20",
  info:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accent:
    "bg-admin-accent/10 text-admin-accent border-admin-accent/20",
};

export function AdminBadge({
  children,
  variant = "default",
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Helper: map a common status string to a badge */
export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  let variant: BadgeVariant = "default";
  if (s === "PUBLISHED" || s === "ACTIVE" || s === "APPROVED" || s === "PASSED")
    variant = "success";
  else if (s === "DRAFT" || s === "PENDING") variant = "warning";
  else if (s === "ARCHIVED" || s === "FAILED" || s === "DELETED")
    variant = "danger";
  else if (s === "REVIEW" || s === "IN_REVIEW" || s === "NEEDS_REVIEW")
    variant = "info";

  return <AdminBadge variant={variant}>{status}</AdminBadge>;
}
