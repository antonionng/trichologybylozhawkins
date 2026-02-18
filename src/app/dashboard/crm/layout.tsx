import Link from "next/link";
import { Surface } from "@/components/layout/Surface";
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
      <Surface variant="subtle" padding="sm" className="flex flex-wrap items-center gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black/60 transition hover:border-black/20 hover:bg-white/90 hover:text-black"
          >
            {item.label}
          </Link>
        ))}
        <div className="flex-1" />
        <Link
          href="/dashboard/crm/contacts/new"
          className="rounded-xl border border-[#fab826]/40 bg-[#fab826]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b67400] transition hover:border-[#fab826] hover:bg-[#fab826]/20"
        >
          New Contact
        </Link>
      </Surface>
      {children}
    </div>
  );
}


