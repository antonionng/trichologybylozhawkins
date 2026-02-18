import { ReactNode } from "react";
import clsx from "clsx";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-admin-elevated text-admin-text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-medium text-admin-text">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-admin-text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
