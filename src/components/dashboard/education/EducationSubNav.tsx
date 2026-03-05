"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { label: "Overview", href: "/dashboard/education", exact: true },
  { label: "Courses", href: "/dashboard/education/courses" },
  { label: "Workshops", href: "/dashboard/education/workshops" },
  { label: "Videos", href: "/dashboard/education/videos" },
  { label: "Quizzes", href: "/dashboard/education/quizzes" },
  { label: "Conditions", href: "/dashboard/education/conditions" },
];

export function EducationSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-admin-border pb-0">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={clsx(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-admin-text"
                : "text-admin-text-muted hover:text-admin-text-secondary"
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-accent rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
