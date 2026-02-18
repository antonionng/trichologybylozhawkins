export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAdminWorkshops } from "@/app/actions/education";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusBadge } from "@/components/admin/AdminBadge";
import { Panel } from "@/components/admin/Panel";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export default async function WorkshopListPage() {
  const workshops = await getAdminWorkshops();

  const rows = await Promise.all(
    (workshops as any[]).map(async (w) => {
      const heroUrl = w.heroMedia?.path
        ? await createSignedDownloadUrl(w.heroMedia.path)
        : null;
      return { ...w, heroUrl };
    })
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="In-Person Workshops"
        subtitle="Manage workshop pages, content, and images"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Workshops" },
        ]}
        actions={
          <AdminButton
            href="/dashboard/education/workshops/new"
            variant="primary"
            size="md"
          >
            + New Workshop
          </AdminButton>
        }
      />

      {rows.length === 0 ? (
        <Panel variant="default" padding="lg">
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-admin-text-muted">No workshops yet.</p>
            <p className="mt-1 text-xs text-admin-text-muted">
              Create your first in-person workshop to start selling training.
            </p>
            <AdminButton
              href="/dashboard/education/workshops/new"
              variant="secondary"
              size="md"
              className="mt-4"
            >
              Create Workshop
            </AdminButton>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((workshop: any) => (
            <Link
              key={workshop.id}
              href={`/dashboard/education/workshops/${workshop.id}`}
              className="group block"
            >
              <Panel variant="default" padding="none" className="overflow-hidden hover:border-admin-border-strong transition-colors">
                {workshop.heroUrl ? (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={workshop.heroUrl}
                      alt={workshop.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center bg-admin-elevated">
                    <span className="text-3xl opacity-30">🎓</span>
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-admin-text group-hover:text-admin-accent transition-colors truncate">
                      {workshop.title}
                    </h3>
                    <StatusBadge status={workshop.status} />
                  </div>
                  <p className="text-xs text-admin-text-muted line-clamp-2">
                    {workshop.summary || "No description yet"}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-admin-text-muted">
                    {workshop.duration && <span>{workshop.duration}</span>}
                    {workshop.investment && (
                      <>
                        <span className="opacity-30">·</span>
                        <span>{workshop.investment}</span>
                      </>
                    )}
                    {workshop.location && (
                      <>
                        <span className="opacity-30">·</span>
                        <span className="truncate">{workshop.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
