"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminTable, AdminColumn } from "@/components/admin/AdminTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminButton } from "@/components/admin/AdminButton";
import { Panel } from "@/components/admin/Panel";

type ContactCompany = { name: string } | null;
type ContactDeal = { id: string }[];

type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  lifecycleStage: string;
  updatedAt: string | Date;
  company: ContactCompany;
  deals: ContactDeal;
};

type ContactListResult = {
  items: ContactListItem[];
  total: number;
  page: number;
  pageSize: number;
};

type QueryState = {
  page: number;
  pageSize: number;
  search: string;
  company: string;
  lifecycleStage: string;
  companyId: string;
  ownerId: string;
  view: "cards" | "table";
};

const LIFECYCLE_OPTIONS = [
  { value: "", label: "All lifecycle" },
  { value: "LEAD", label: "Lead" },
  { value: "MARKETING_QUALIFIED_LEAD", label: "MQL" },
  { value: "SALES_QUALIFIED_LEAD", label: "SQL" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "EVANGELIST", label: "Evangelist" },
  { value: "OTHER", label: "Other" },
];

function formatUpdatedAt(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function buildQuery(next: Partial<QueryState>, current: QueryState) {
  const merged: QueryState = { ...current, ...next };
  const params = new URLSearchParams();
  if (merged.page && merged.page !== 1) params.set("page", String(merged.page));
  if (merged.pageSize && merged.pageSize !== 20) params.set("pageSize", String(merged.pageSize));
  if (merged.search) params.set("search", merged.search);
  if (merged.company) params.set("company", merged.company);
  if (merged.lifecycleStage) params.set("lifecycleStage", merged.lifecycleStage);
  if (merged.companyId) params.set("companyId", merged.companyId);
  if (merged.ownerId) params.set("ownerId", merged.ownerId);
  if (merged.view) params.set("view", merged.view);
  return params.toString();
}

export function buildContactExportHref(selectedIds: string[]) {
  const params = new URLSearchParams();
  for (const id of selectedIds) {
    params.append("ids", id);
  }
  const query = params.toString();
  return query ? `/api/crm/contacts/export?${query}` : "/api/crm/contacts/export";
}

export function ContactsIndexClient({
  initialResult,
  initialQuery,
}: {
  initialResult: ContactListResult;
  initialQuery: QueryState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const queryFromUrl = useMemo(() => {
    const get = (k: string) => searchParams?.get(k) ?? "";
    return {
      page: Number(get("page") || initialQuery.page || 1),
      pageSize: Number(get("pageSize") || initialQuery.pageSize || 20),
      search: get("search") || initialQuery.search || "",
      company: get("company") || initialQuery.company || "",
      lifecycleStage: get("lifecycleStage") || initialQuery.lifecycleStage || "",
      companyId: get("companyId") || initialQuery.companyId || "",
      ownerId: get("ownerId") || initialQuery.ownerId || "",
      view: (get("view") as QueryState["view"]) || initialQuery.view || "table",
    } satisfies QueryState;
  }, [searchParams, initialQuery]);

  const applyQuery = (next: Partial<QueryState>) => {
    const qs = buildQuery(next, queryFromUrl);
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  };

  // Debounced search
  const [searchVal, setSearchVal] = useState(queryFromUrl.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchVal !== queryFromUrl.search) applyQuery({ search: searchVal, page: 1 });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchVal]);

  const items = initialResult.items;
  const totalPages = Math.max(1, Math.ceil(initialResult.total / initialResult.pageSize));

  // Selection for bulk actions
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const columns: AdminColumn<ContactListItem>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => (
        <Link
          href={`/dashboard/crm/contacts/${row.id}`}
          className="text-sm font-medium text-admin-text hover:text-admin-accent transition-colors"
        >
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <span className="text-sm text-admin-text-secondary">{row.email}</span>,
    },
    {
      key: "company",
      header: "Company",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row.company?.name ?? "—"}</span>
      ),
    },
    {
      key: "lifecycle",
      header: "Lifecycle",
      render: (row) => (
        <AdminBadge variant="accent">
          {String(row.lifecycleStage).replace(/_/g, " ")}
        </AdminBadge>
      ),
    },
    {
      key: "deals",
      header: "Deals",
      className: "text-right",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row.deals?.length ?? 0}</span>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (row) => (
        <span className="text-xs text-admin-text-muted">{formatUpdatedAt(row.updatedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <AdminInput
            placeholder="Search name or email…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div className="w-44">
          <select
            className="block w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/40"
            value={queryFromUrl.lifecycleStage}
            onChange={(e) => applyQuery({ lifecycleStage: e.target.value, page: 1 })}
          >
            {LIFECYCLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-admin-text-muted">
            {initialResult.total} contacts
          </span>
          <AdminButton href="/dashboard/crm/contacts/new" variant="primary" size="sm">
            + New Contact
          </AdminButton>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <Panel variant="elevated" padding="sm" className="flex items-center gap-3">
          <span className="text-xs text-admin-text-secondary">{selected.size} selected</span>
          <AdminButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </AdminButton>
          <AdminButton
            href={buildContactExportHref(Array.from(selected))}
            variant="secondary"
            size="sm"
          >
            Export CSV
          </AdminButton>
        </Panel>
      )}

      {/* Table */}
      <AdminTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.id}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        renderActions={(row) => (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <AdminButton href={`/dashboard/crm/contacts/${row.id}`} variant="ghost" size="sm">
              View
            </AdminButton>
          </div>
        )}
        emptyMessage="No contacts match your filters."
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <AdminButton
          variant="secondary"
          size="sm"
          disabled={initialResult.page <= 1}
          onClick={() => applyQuery({ page: Math.max(1, initialResult.page - 1) })}
        >
          ← Prev
        </AdminButton>
        <span className="text-xs text-admin-text-muted">
          Page {initialResult.page} of {totalPages}
        </span>
        <AdminButton
          variant="secondary"
          size="sm"
          disabled={initialResult.page >= totalPages}
          onClick={() => applyQuery({ page: Math.min(totalPages, initialResult.page + 1) })}
        >
          Next →
        </AdminButton>
      </div>
    </div>
  );
}
