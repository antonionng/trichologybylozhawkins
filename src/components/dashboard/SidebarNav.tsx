"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ReactNode } from "react";

/* ───────── Types ───────── */

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type SidebarNavProps = {
  groups: NavGroup[];
  collapsed?: boolean;
};

/* ───────── Component ───────── */

export function SidebarNav({ groups, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-admin-text-muted">
              {group.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-white/[0.06] text-admin-text font-medium"
                      : "text-admin-text-secondary hover:bg-white/[0.04] hover:text-admin-text"
                  )}
                  title={item.label}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-admin-accent" />
                  )}
                  <span
                    className={clsx(
                      "flex h-5 w-5 shrink-0 items-center justify-center",
                      isActive ? "text-admin-accent" : "text-admin-text-muted group-hover:text-admin-text-secondary"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
