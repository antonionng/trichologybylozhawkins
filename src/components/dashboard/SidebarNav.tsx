/* eslint-disable react/jsx-key */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export type SidebarNavItem = {
  href: string;
  label: string;
  description?: string;
};

export type SidebarNavProps = {
  items: SidebarNavItem[];
};

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-lg px-4 py-3 transition-colors",
              "border border-transparent",
              "bg-white/5",
              isActive
                ? "border-[#fab826] bg-white/10 text-[#fab826]"
                : "hover:border-white/20 hover:bg-white/10"
            )}
          >
            <div className="text-sm font-semibold uppercase tracking-wide">
              {item.label}
            </div>
            {item.description ? (
              <div className="text-xs text-white/60">{item.description}</div>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

