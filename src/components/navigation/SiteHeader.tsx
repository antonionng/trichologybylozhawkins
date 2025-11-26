'use client';

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ButtonLink } from "@/components/ui/Button";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/education", label: "Education" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Knowledge Hub" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-graphite/10 bg-brand-ivory backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="font-display text-sm uppercase tracking-[0.6em] text-brand-graphite hover:text-brand-graphite/80 transition-colors"
        >
          LORRAINE HAWKINS
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-brand-graphite/75 lg:flex">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
          ))}
        </nav>
        <div className="hidden lg:flex">
          <ButtonLink href="/contact" size="sm" variant="secondary" textured>
            Register Interest
          </ButtonLink>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center rounded-full border border-brand-graphite/20 px-3 py-2 text-sm text-brand-graphite/75 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          Menu
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.95, 0.45, 1] }}
            className="border-t border-brand-graphite/10 bg-brand-ivory px-6 py-6 sm:px-10 lg:hidden"
          >
            <ul className="space-y-4 text-base text-brand-graphite">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-full border border-transparent px-3 py-2 hover:border-brand-graphite/20 hover:bg-brand-mist/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/contact"
              size="md"
              variant="secondary"
              textured
              className="mt-6 w-full justify-center"
              onClick={() => setOpen(false)}
            >
              Register Interest
            </ButtonLink>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "transition-colors duration-200",
        active ? "text-brand-graphite font-semibold" : "hover:text-brand-graphite",
      )}
    >
      {label}
    </Link>
  );
}

