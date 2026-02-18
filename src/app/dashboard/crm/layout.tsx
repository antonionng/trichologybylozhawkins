import Link from "next/link";
import { Panel } from "@/components/admin/Panel";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard/crm", label: "Overview" },
  { href: "/dashboard/crm/contacts", label: "Contacts" },
];

export default function CrmLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Panel variant="elevated" padding="sm" className="flex flex-wrap items-center gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-admin-border-strong bg-admin-panel px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-admin-text-secondary transition hover:border-admin-accent/40 hover:bg-admin-elevated hover:text-admin-text"
          >
            {item.label}
          </Link>
        ))}
        <div className="flex-1" />
        <Link
          href="/dashboard/crm/contacts/new"
          className="rounded-md bg-admin-accent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-admin-accent-hover active:brightness-90"
        >
          New Contact
        </Link>
      </Panel>
      {children}
    </div>
  );
}
