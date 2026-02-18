'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ButtonLink } from "@/components/ui/Button";
import { usePathname } from "next/navigation";

interface Session {
  uid: string;
  role: "ADMIN" | "LEARNER";
  exp: number;
}

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string; tag?: string }[];
};

const navItems: NavItem[] = [
  {
    href: "/education",
    label: "Education",
    children: [
      { href: "/education/videos", label: "Video Courses" },
      { href: "/education#courses", label: "Training Courses" },
      { href: "/education#workshops", label: "In-Person Workshops" },
      { href: "/blog", label: "Knowledge Hub" },
    ],
  },
  { href: "/about", label: "About Lorraine" },
  { href: "/contact", label: "Contact" },
];

// Flatten for mobile
const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/education", label: "Education" },
  { href: "/education/videos", label: "Video Courses" },
  { href: "/education#courses", label: "Training Courses" },
  { href: "/education#workshops", label: "In-Person Workshops" },
  { href: "/blog", label: "Knowledge Hub" },
  { href: "/about", label: "About Lorraine" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ session }: { session: Session | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/academy")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-graphite/10 bg-brand-ivory backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-sm uppercase tracking-[0.5em] text-brand-graphite hover:text-brand-graphite/80 transition-colors"
        >
          Lorraine Hawkins
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm text-brand-graphite/75 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <DropdownNavItem key={item.label} item={item} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-3 py-1.5 transition-colors",
                  pathname === item.href
                    ? "text-brand-graphite font-semibold"
                    : "hover:text-brand-graphite hover:bg-brand-graphite/5"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              {session.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-brand-graphite/70 hover:text-brand-graphite transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <ButtonLink
                href="/academy"
                size="sm"
                variant="secondary"
                textured
              >
                My Academy
              </ButtonLink>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-graphite/70 hover:text-brand-graphite transition-colors"
              >
                Login
              </Link>
              <ButtonLink href="/education" size="sm" variant="secondary" textured>
                Browse Training
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center rounded-full border border-brand-graphite/20 px-3 py-2 text-sm text-brand-graphite/75 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.95, 0.45, 1] }}
            className="border-t border-brand-graphite/10 bg-brand-ivory px-6 py-6 sm:px-10 lg:hidden"
          >
            <ul className="space-y-1 text-base text-brand-graphite">
              {mobileLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "block rounded-lg px-3 py-2.5 transition-colors",
                      pathname === link.href
                        ? "bg-brand-salmon/10 font-semibold text-brand-graphite"
                        : "hover:bg-brand-graphite/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              {session ? (
                <>
                  {session.role === "ADMIN" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-brand-graphite/10 text-sm font-medium text-brand-graphite"
                    >
                      Dashboard
                    </Link>
                  )}
                  <ButtonLink
                    href="/academy"
                    size="md"
                    variant="secondary"
                    textured
                    className="w-full justify-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Academy
                  </ButtonLink>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl border border-brand-graphite/10 text-sm font-medium text-brand-graphite"
                  >
                    Login
                  </Link>
                  <ButtonLink
                    href="/education"
                    size="md"
                    variant="secondary"
                    textured
                    className="w-full justify-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Browse Training
                  </ButtonLink>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Dropdown nav item (desktop) ──────────────────────────────────────────── */

function DropdownNavItem({ item, pathname }: { item: NavItem; pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const isActive = item.children?.some((c) => pathname === c.href || pathname?.startsWith(c.href + "/"));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timeout.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <button
        type="button"
        className={clsx(
          "rounded-full px-3 py-1.5 transition-colors inline-flex items-center gap-1",
          isActive
            ? "text-brand-graphite font-semibold"
            : "hover:text-brand-graphite hover:bg-brand-graphite/5"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 12 12">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-brand-graphite/10 bg-brand-ivory p-2 shadow-lg"
          >
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === child.href
                    ? "bg-brand-salmon/10 font-semibold text-brand-graphite"
                    : "text-brand-graphite/75 hover:bg-brand-graphite/5 hover:text-brand-graphite"
                )}
              >
                <span>{child.label}</span>
                {child.tag && (
                  <span className="rounded-full bg-brand-salmon/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-salmon">
                    {child.tag}
                  </span>
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
