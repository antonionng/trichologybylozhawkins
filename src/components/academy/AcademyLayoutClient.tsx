"use client";

import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";

const ic = "h-4 w-4 stroke-current";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 115.12 2.12c-.58.59-1.12 1.1-1.12 1.88m0 3h.01" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type NavItem = { href: string; label: string; icon: ReactNode; tab?: string };

const LEARNER_NAV: NavItem[] = [
  { href: "/academy", label: "My Library", icon: <BookIcon />, tab: "library" },
  { href: "/academy?tab=browse", label: "Browse Courses", icon: <BrowseIcon />, tab: "browse" },
  { href: "/academy?tab=videos", label: "Videos", icon: <PlayIcon />, tab: "videos" },
  { href: "/academy?tab=quizzes", label: "Quizzes", icon: <QuizIcon />, tab: "quizzes" },
];

function UserDropdown({
  displayName,
  initial,
  isAdmin,
  onLogout,
}: {
  displayName: string;
  initial: string;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-brand-graphite/10 bg-white px-3 py-1.5 text-sm transition-colors hover:border-brand-graphite/20"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-salmon/20 text-[10px] font-bold text-brand-salmon">
          {initial}
        </span>
        <span className="hidden text-brand-graphite/70 sm:inline">{displayName}</span>
        <svg className="h-3 w-3 text-brand-graphite/40" fill="none" viewBox="0 0 12 12">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-brand-graphite/10 bg-white p-1.5 shadow-card">
          <div className="border-b border-brand-graphite/5 px-3 py-2">
            <p className="text-sm font-medium text-brand-graphite">{displayName}</p>
            <p className="text-xs text-brand-graphite/50">Learner Portal</p>
          </div>

          <div className="py-1">
            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-graphite/70 transition-colors hover:bg-brand-graphite/5 hover:text-brand-graphite"
              >
                <AdminIcon />
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-graphite/70 transition-colors hover:bg-brand-graphite/5 hover:text-brand-graphite"
            >
              <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 12l6-6M3 12l6 6" />
              </svg>
              Back to Website
            </Link>
          </div>

          <div className="border-t border-brand-graphite/5 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600/70 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <svg viewBox="0 0 24 24" className={ic} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface AcademyLayoutClientProps {
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

export default function AcademyLayoutClient({ children, user }: AcademyLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const isAcademyHome = pathname === "/academy";

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

  const initial = user.contact?.firstName?.[0] || user.email[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-brand-sand text-brand-graphite">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-brand-graphite/8 bg-white transition-all duration-200 lg:static",
            collapsed ? "w-[56px]" : "w-[220px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Brand */}
          <div className="flex items-center justify-between border-b border-brand-graphite/8 px-3 shrink-0 min-h-[56px]">
            {!collapsed && (
              <Link href="/academy" className="flex flex-col items-start min-w-0 py-2">
                <span className="font-display text-[11px] uppercase tracking-[0.35em] text-brand-graphite">
                  Lorraine Hawkins
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-brand-graphite/50 font-medium mt-0.5">
                  Academy
                </span>
              </Link>
            )}
            {collapsed && (
              <Link href="/academy" className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-brand-salmon text-[10px] font-bold text-white">
                LH
              </Link>
            )}
          </div>

          {/* Navigation */}
          <div className={clsx("flex-1 overflow-y-auto py-4", collapsed ? "px-1" : "px-2")}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-brand-graphite/40">
                Learning
              </p>
            )}
            <nav className="flex flex-col gap-0.5">
              {LEARNER_NAV.map((item) => {
                const isActive = isAcademyHome
                  ? item.tab === "library"
                    ? !currentTab || currentTab === "library"
                    : currentTab === item.tab
                  : false;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-brand-salmon/10 font-medium text-brand-graphite"
                        : "text-brand-graphite/60 hover:bg-brand-graphite/5 hover:text-brand-graphite"
                    )}
                    title={item.label}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-brand-salmon" />
                    )}
                    <span
                      className={clsx(
                        "flex h-5 w-5 shrink-0 items-center justify-center",
                        isActive ? "text-brand-salmon" : "text-brand-graphite/40 group-hover:text-brand-graphite/60"
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Admin link */}
            {user.role === "ADMIN" && !collapsed && (
              <div className="mt-6 border-t border-brand-graphite/8 pt-4">
                <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-brand-graphite/40">
                  Admin
                </p>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-brand-graphite/60 transition-colors hover:bg-brand-graphite/5 hover:text-brand-graphite"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-brand-graphite/40">
                    <AdminIcon />
                  </span>
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Bottom: collapse toggle + user */}
          <div className="border-t border-brand-graphite/8 p-2 shrink-0 space-y-1">
            <button
              onClick={() => setCollapsed((p) => !p)}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs text-brand-graphite/40 hover:bg-brand-graphite/5 hover:text-brand-graphite/60 transition-colors"
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

            <div className={clsx(
              "flex items-center gap-2 rounded-md px-2 py-1.5",
              collapsed && "justify-center"
            )}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-salmon/20 text-[10px] font-semibold text-brand-salmon">
                {initial}
              </span>
              {!collapsed && (
                <span className="truncate text-xs text-brand-graphite/60">
                  {displayName}
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-12 items-center justify-between border-b border-brand-graphite/8 bg-white px-4 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-brand-graphite/50 hover:text-brand-graphite"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page title breadcrumb - only on subpages */}
              {!isAcademyHome && (
                <nav className="flex items-center gap-1.5 text-xs text-brand-graphite/40">
                  <Link href="/academy" className="hover:text-brand-graphite/70 transition-colors">
                    Academy
                  </Link>
                  <span className="text-brand-graphite/20">/</span>
                  <span className="text-brand-graphite/70 font-medium truncate max-w-[200px] sm:max-w-none">
                    {pathname.split("/").filter(Boolean).slice(1).map(
                      s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")
                    ).join(" / ")}
                  </span>
                </nav>
              )}
            </div>

            <UserDropdown
              displayName={displayName}
              initial={initial}
              isAdmin={user.role === "ADMIN"}
              onLogout={handleLogout}
            />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
