import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { Surface } from "@/components/layout/Surface";

const NAV_ITEMS = [
  {
    href: "/dashboard/crm",
    label: "CRM",
    description: "Pipeline, contacts, and team actions",
  },
  {
    href: "/dashboard/cms",
    label: "CMS",
    description: "Collections, entries, and media",
  },
  {
    href: "/dashboard/education",
    label: "Education",
    description: "Course catalog & enrollments",
  },
  {
    href: "/dashboard/email",
    label: "Email",
    description: "Campaigns and automations",
  },
  {
    href: "/dashboard/ai",
    label: "AI Studio",
    description: "Prompt templates & drafts",
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      <header className="border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#fab826]/30 bg-[#fab826]/20 text-sm font-semibold uppercase tracking-widest text-[#bf7c00]">
              BH
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                Bunny At Home Platform
              </p>
              <p className="text-lg font-semibold text-black">
                Growth Operations Control Centre
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-black/70">
            <span className="hidden sm:inline">v0.1 Internal Build</span>
            <Link
              href="/"
              className="rounded-full border border-[#fab826]/40 px-3 py-1 text-xs uppercase tracking-wide text-[#bf7c00] transition hover:border-[#fab826] hover:bg-[#fab826]/10"
            >
              View Site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-10 lg:px-8">
        <aside className="w-full max-w-xs flex-none">
          <Surface variant="glass" padding="lg" className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Navigation
              </p>
              <h2 className="mt-1 text-xl font-semibold text-black">
                Operating Modes
              </h2>
            </div>
            <SidebarNav items={NAV_ITEMS} />
            <div className="rounded-lg border border-black/5 bg-white/40 p-4 text-xs text-black/60">
              <p className="font-semibold uppercase tracking-[0.2em] text-[#bf7c00]">
                Coming Soon
              </p>
              <p>
                Role-based access, calendar sync, and revenue insights will land
                in the next release.
              </p>
            </div>
          </Surface>
        </aside>
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}

