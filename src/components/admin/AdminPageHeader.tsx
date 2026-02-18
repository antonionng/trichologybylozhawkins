import { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={clsx("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-admin-text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-admin-text-muted/50">/</span> : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-admin-text-secondary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-admin-text-secondary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-admin-text">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-admin-text-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
