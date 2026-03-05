'use client';

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { SidebarNav, NavGroup } from "@/components/dashboard/SidebarNav";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { ToastProvider } from "@/components/admin/Toast";

/* ───────── Icon helper ───────── */

const ic = "h-4 w-4 stroke-current";

/* ───────── Admin nav groups ───────── */

const ADMIN_NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Education",
    items: [
      {
        href: "/dashboard/education",
        label: "Overview",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M3 7l9-4 9 4-9 4-9-4z" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M6 10v6c0 2 3 4 6 4s6-2 6-4v-6" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/education/courses",
        label: "Courses",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/education/workshops",
        label: "Workshops",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m14-6v2m0-4v2m-4-4h.01M17 17h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/education/videos",
        label: "Videos",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <polygon points="5,3 19,12 5,21" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/education/quizzes",
        label: "Quizzes",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
            <path d="M9 9a3 3 0 115.12 2.12c-.58.59-1.12 1.1-1.12 1.88m0 3h.01" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/education/conditions",
        label: "Conditions",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M9 12h6m-3-3v6m-7 4V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2z" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        href: "/dashboard/crm",
        label: "Pipeline",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M4 4h16v3l-6 5v5l-4 3V12L4 7V4z" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/crm/contacts",
        label: "Contacts",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m22-4v2m-7-6a4 4 0 11-8 0 4 4 0 018 0zm4 0a3 3 0 11-6 0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Knowledge Hub",
    items: [
      {
        href: "/dashboard/knowledge-hub",
        label: "Articles",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M7 7h10M7 11h10M7 15h6" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        href: "/dashboard/content",
        label: "Content Factory",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.6" />
            <path d="M3 9h18M8 4v16" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/email",
        label: "Email",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.6" />
            <path d="M3 8l9 6 9-6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Shop",
    items: [
      {
        href: "/dashboard/shop",
        label: "Overview",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M6 7h15l-1.5 9h-12zM6 7L4.5 3H2m6 16a1 1 0 100 2 1 1 0 000-2zm9 0a1 1 0 100 2 1 1 0 000-2z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/shop/products",
        label: "Products",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11M4 7l8 4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/shop/categories",
        label: "Categories",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M7 7h10v10H7zM3 3h4v4H3zm14 0h4v4h-4zM3 17h4v4H3zm14 0h4v4h-4z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/shop/orders",
        label: "Orders",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M9 12h6m-6 4h6M7 3h10l4 4v14H3V3h4z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
];

/* ───────── Learner nav ───────── */

const LEARNER_NAV: NavGroup[] = [
  {
    title: "Learning",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/academy",
        label: "Academy",
        icon: (
          <svg viewBox="0 0 24 24" className={ic} fill="none">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
];

/* ───────── Breadcrumb builder ───────── */

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: path });
  }
  // Last crumb has no link (current page)
  if (crumbs.length) delete crumbs[crumbs.length - 1].href;
  return crumbs;
}

/* ───────── Main Layout ───────── */

interface DashboardLayoutClientProps {
  children: ReactNode;
  user: {
    role: "ADMIN" | "LEARNER";
    email: string;
    contact?: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

export default function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navGroups = user.role === "ADMIN" ? ADMIN_NAV : LEARNER_NAV;
  const breadcrumbs = buildBreadcrumbs(pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const displayName = user.contact
    ? `${user.contact.firstName} ${user.contact.lastName}`
    : user.email;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-admin-bg text-admin-text">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex h-screen overflow-hidden">
          {/* ── Sidebar ── */}
          <aside
            className={clsx(
              "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-admin-border bg-admin-panel transition-all duration-200 lg:static",
              collapsed ? "w-[56px]" : "w-[240px]",
              mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            {/* Logo / brand */}
            <div className="flex h-14 items-center justify-between px-3 border-b border-admin-border shrink-0">
              {!collapsed && (
                <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-admin-accent text-[10px] font-bold text-black">
                    LH
                  </span>
                  <span className="truncate text-xs font-semibold text-admin-text">
                    Lorraine Hawkins
                  </span>
                </Link>
              )}
              {collapsed && (
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent text-[10px] font-bold text-black">
                  LH
                </span>
              )}
            </div>

            {/* Nav */}
            <div className={clsx("flex-1 overflow-y-auto py-3", collapsed ? "px-1" : "px-2")}>
              <SidebarNav groups={navGroups} collapsed={collapsed} />
            </div>

            {/* Bottom: portal switch + user + collapse */}
            <div className="border-t border-admin-border p-2 shrink-0 space-y-1">
              {/* Learner portal link (ADMIN only) */}
              {user.role === "ADMIN" && (
                <Link
                  href="/academy"
                  className={clsx(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-admin-text-muted hover:bg-white/[0.04] hover:text-admin-text-secondary transition-colors",
                    collapsed && "justify-center"
                  )}
                  title="Learner Portal"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {!collapsed && <span>Learner Portal</span>}
                </Link>
              )}

              {/* Collapse toggle */}
              <button
                onClick={() => setCollapsed((p) => !p)}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs text-admin-text-muted hover:bg-white/[0.04] hover:text-admin-text-secondary transition-colors"
              >
                {collapsed ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    <span>Collapse</span>
                  </>
                )}
              </button>

              {/* User + logout */}
              <div className={clsx(
                "flex items-center gap-2 rounded-md px-2 py-1.5",
                collapsed && "justify-center"
              )}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-admin-accent/20 text-[10px] font-semibold text-admin-accent">
                  {user.contact?.firstName?.[0] || user.email[0]?.toUpperCase()}
                </span>
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate text-xs text-admin-text-secondary">
                      {displayName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="shrink-0 text-admin-text-muted hover:text-admin-danger transition-colors"
                      title="Sign out"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main area ── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top bar */}
            <header className="flex h-12 items-center justify-between border-b border-admin-border bg-admin-panel px-4 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden text-admin-text-muted hover:text-admin-text"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 text-xs text-admin-text-muted">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-admin-text-muted/40">/</span>}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-admin-text-secondary transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-admin-text-secondary">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                {/* Cmd+K trigger */}
                {user.role === "ADMIN" && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new KeyboardEvent("keydown", { key: "k", metaKey: true })
                      );
                    }}
                    className="hidden sm:flex items-center gap-2 rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-1 text-xs text-admin-text-muted hover:text-admin-text-secondary transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <span>Search</span>
                    <kbd className="rounded border border-admin-border bg-admin-panel px-1 py-px text-[10px] font-mono">
                      ⌘K
                    </kbd>
                  </button>
                )}
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto bg-admin-bg p-6">
              {children}
            </main>
          </div>
        </div>

        {/* Command palette */}
        {user.role === "ADMIN" && <CommandPalette />}
      </div>
    </ToastProvider>
  );
}
