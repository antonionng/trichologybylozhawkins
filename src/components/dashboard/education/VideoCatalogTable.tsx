"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AdminTable, AdminColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/AdminBadge";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminButton } from "@/components/admin/AdminButton";

export function VideoCatalogTable({ videos }: { videos: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const columns: AdminColumn<any>[] = [
    {
      key: "title",
      header: "Video",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-admin-border bg-admin-elevated shrink-0">
            {row.heroUrl ? (
              <Image src={row.heroUrl} alt="" fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-admin-text-muted">
                ▶
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/education/videos/${row.id}`}
              className="text-sm font-medium text-admin-text hover:text-admin-accent transition-colors truncate block"
            >
              {row.title}
            </Link>
            <p className="text-xs text-admin-text-muted truncate">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row.category ?? "—"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "text-right",
      render: (row) => {
        const p = row.pricing?.find((p: any) => p.isPrimary) ?? row.pricing?.[0];
        return (
          <span className="text-sm font-medium text-admin-text">
            {p ? `${p.currency === "GBP" ? "£" : p.currency + " "}${p.amount}` : "—"}
          </span>
        );
      },
    },
    {
      key: "accesses",
      header: "Access",
      className: "text-right",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row._count?.accesses ?? 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="max-w-sm">
        <AdminInput
          placeholder="Search videos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <AdminTable
        columns={columns}
        data={filtered}
        getRowKey={(r) => r.id}
        renderActions={(row) => (
          <div className="flex items-center gap-2">
            <AdminButton href={`/dashboard/education/videos/${row.id}`} variant="ghost" size="sm">
              Edit
            </AdminButton>
            <AdminButton href={`/education/videos/${row.slug}`} variant="ghost" size="sm">
              Preview
            </AdminButton>
          </div>
        )}
      />
    </div>
  );
}
