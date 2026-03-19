import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/AdminBadge";
import { EducationSubNav } from "@/components/dashboard/education/EducationSubNav";

export const dynamic = "force-dynamic";

async function getEnquiries() {
  return prisma.courseEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      course: { select: { id: true, title: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function EducationEnquiriesPage() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/education/enquiries" });
  const enquiries = await getEnquiries();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Education Enquiries"
        subtitle="Review incoming course interest and jump straight into follow-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Enquiries" },
        ]}
      />

      <EducationSubNav />

      <Panel variant="default" padding="none" className="overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_120px_120px] gap-4 border-b border-admin-border px-4 py-3 text-[11px] uppercase tracking-wider text-admin-text-muted">
          <span>Contact</span>
          <span>Course</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {enquiries.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-admin-text-muted">
            No education enquiries yet.
          </div>
        ) : (
          <div className="divide-y divide-admin-border">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="grid grid-cols-[1.4fr_1fr_120px_120px] gap-4 px-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-admin-text">{enquiry.name}</p>
                  <p className="text-xs text-admin-text-muted">{enquiry.email}</p>
                  <p className="mt-1 text-xs text-admin-text-muted">
                    {formatDate(enquiry.createdAt)}
                  </p>
                  {enquiry.message ? (
                    <p className="mt-2 line-clamp-2 text-xs text-admin-text-secondary">
                      {enquiry.message}
                    </p>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-admin-text">
                    {enquiry.course?.title ?? "Unknown course"}
                  </p>
                  {enquiry.contact ? (
                    <p className="text-xs text-admin-text-muted">
                      Linked to {enquiry.contact.firstName} {enquiry.contact.lastName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <StatusBadge status={enquiry.status} />
                </div>

                <div className="text-right">
                  {enquiry.contactId ? (
                    <Link
                      href={`/dashboard/crm/contacts/${enquiry.contactId}`}
                      className="text-xs font-medium text-admin-accent hover:underline"
                    >
                      Open contact
                    </Link>
                  ) : (
                    <span className="text-xs text-admin-text-muted">No contact</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
