"use client";

import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

/* ───────── Types ───────── */

export interface CommandItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  action?: () => void;
  group?: string;
}

/* ───────── Static nav commands ───────── */

const defaultCommands: CommandItem[] = [
  { id: "dash", label: "Dashboard", href: "/dashboard", group: "Navigation" },
  { id: "edu", label: "Education", href: "/dashboard/education", group: "Navigation" },
  { id: "courses", label: "Courses", href: "/dashboard/education/courses", group: "Education" },
  { id: "workshops", label: "Workshops", href: "/dashboard/education/workshops", group: "Education" },
  { id: "videos", label: "Videos", href: "/dashboard/education/videos", group: "Education" },
  { id: "quizzes", label: "Quizzes", href: "/dashboard/education/quizzes", group: "Education" },
  { id: "conditions", label: "Conditions", href: "/dashboard/education/conditions", group: "Education" },
  { id: "crm", label: "CRM Pipeline", href: "/dashboard/crm", group: "CRM" },
  { id: "contacts", label: "Contacts", href: "/dashboard/crm/contacts", group: "CRM" },
  { id: "knowledge-hub", label: "Knowledge Hub", href: "/dashboard/knowledge-hub", group: "Marketing" },
  { id: "content", label: "Content Factory", href: "/dashboard/content", group: "Marketing" },
  { id: "email", label: "Email", href: "/dashboard/email", group: "Marketing" },
  { id: "new-course", label: "New Course", href: "/dashboard/education/courses/new", group: "Quick Actions" },
  { id: "new-workshop", label: "New Workshop", href: "/dashboard/education/workshops/new", group: "Quick Actions" },
  { id: "new-video", label: "New Video", href: "/dashboard/education/videos/new", group: "Quick Actions" },
  { id: "new-contact", label: "New Contact", href: "/dashboard/crm/contacts/new", group: "Quick Actions" },
  { id: "new-article", label: "New Article", href: "/dashboard/knowledge-hub/new", group: "Quick Actions" },
];

/* ───────── Component ───────── */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = defaultCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const execute = useCallback(
    (cmd: CommandItem) => {
      setOpen(false);
      if (cmd.href) router.push(cmd.href);
      else cmd.action?.();
    },
    [router]
  );

  function onKeyDownInner(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      execute(filtered[activeIndex]);
    }
  }

  if (!open) return null;

  // Group items
  const groups: Record<string, CommandItem[]> = {};
  filtered.forEach((cmd) => {
    const g = cmd.group || "Other";
    if (!groups[g]) groups[g] = [];
    groups[g].push(cmd);
  });

  return (
    <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative mx-auto mt-[20vh] w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-xl border border-admin-border-strong bg-admin-panel shadow-2xl">
          {/* Input */}
          <div className="flex items-center border-b border-admin-border px-4">
            <svg className="h-4 w-4 text-admin-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDownInner}
              placeholder="Search commands…"
              className="flex-1 bg-transparent px-3 py-3 text-sm text-admin-text placeholder:text-admin-text-muted focus:outline-none"
            />
            <kbd className="hidden sm:inline-block rounded border border-admin-border-strong bg-admin-elevated px-1.5 py-0.5 text-[10px] text-admin-text-muted font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-admin-text-muted">
                No results found
              </p>
            ) : (
              Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-admin-text-muted">
                    {group}
                  </p>
                  {items.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={clsx(
                          "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                          idx === activeIndex
                            ? "bg-admin-accent/10 text-admin-text"
                            : "text-admin-text-secondary hover:bg-white/[0.03]"
                        )}
                      >
                        {cmd.icon}
                        <span>{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
