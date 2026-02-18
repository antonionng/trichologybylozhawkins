"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CourseStatus } from "@prisma/client";
import { AdminTable, AdminColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/AdminBadge";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminButton } from "@/components/admin/AdminButton";

type CourseCatalogRow = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  enrollmentType: string;
  heroUrl?: string | null;
  pricing?: Array<{
    amount: unknown;
    currency: string;
    isPrimary: boolean;
  }>;
  _count?: {
    modules?: number;
    enrollments?: number;
  };
};

function formatPrice(course: CourseCatalogRow) {
  const primaryPrice =
    course.pricing?.find((p) => p.isPrimary) ?? course.pricing?.[0];
  if (!primaryPrice) return "Free / Unset";
  const amount = Number(primaryPrice.amount);
  const label = Number.isFinite(amount) ? amount.toFixed(2) : String(primaryPrice.amount);
  return primaryPrice.currency === "GBP"
    ? `£${label}`
    : `${primaryPrice.currency} ${label}`;
}

export function CourseCatalogTable({ courses }: { courses: CourseCatalogRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: AdminColumn<CourseCatalogRow>[] = [
    {
      key: "title",
      header: "Course",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-admin-border bg-admin-elevated shrink-0">
            {row.heroUrl ? (
              <Image src={row.heroUrl} alt="" fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-admin-text-muted">
                {row.title[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/education/courses/${row.id}`}
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
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "delivery",
      header: "Delivery",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">
          {row.enrollmentType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "text-right",
      render: (row) => (
        <span className="text-sm font-medium text-admin-text">{formatPrice(row)}</span>
      ),
    },
    {
      key: "modules",
      header: "Modules",
      className: "text-right",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row._count?.modules ?? 0}</span>
      ),
    },
    {
      key: "learners",
      header: "Learners",
      className: "text-right",
      render: (row) => (
        <span className="text-sm text-admin-text-secondary">{row._count?.enrollments ?? 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <AdminInput
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All statuses"
            options={[
              { value: "", label: "All statuses" },
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Draft" },
              { value: "REVIEW", label: "Review" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
        </div>
      </div>
      <AdminTable
        columns={columns}
        data={filtered}
        getRowKey={(r) => r.id}
        onRowClick={undefined}
        renderActions={(row) => (
          <div className="flex items-center gap-2">
            <AdminButton href={`/dashboard/education/courses/${row.id}`} variant="ghost" size="sm">
              Edit
            </AdminButton>
            {row.status === "PUBLISHED" && (
              <AdminButton href={`/education/${row.slug}`} variant="ghost" size="sm">
                Preview
              </AdminButton>
            )}
          </div>
        )}
      />
    </div>
  );
}
