export const dynamic = "force-dynamic";

import Link from "next/link";
import { listContacts, getPipelineBoard, listRecentActivities } from "@/server/modules/crm/service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminMetric } from "@/components/admin/AdminMetric";
import { Panel } from "@/components/admin/Panel";
import { AdminBadge } from "@/components/admin/AdminBadge";

export default async function CrmDashboard() {
  const [pipeline, contacts, activities] = await Promise.all([
    getPipelineBoard(),
    listContacts({ page: 1, pageSize: 20 }),
    listRecentActivities(8),
  ]);

  const allStages = pipeline.flatMap((lane) =>
    lane.stages.map((stage) => ({ ...stage, pipelineName: lane.name }))
  );

  const totalDeals = allStages.reduce((s, st) => s + st.deals.length, 0);
  const totalValue = allStages.reduce(
    (s, st) => s + st.deals.reduce((a: number, d: any) => a + Number(d.amount ?? 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CRM Pipeline"
        subtitle="Manage deals, contacts, and activities"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "CRM" }]}
        actions={
          <>
            <AdminButton href="/dashboard/crm/contacts/new" variant="primary" size="md">
              + New Contact
            </AdminButton>
            <AdminButton href="/dashboard/crm/contacts" variant="secondary" size="md">
              All Contacts
            </AdminButton>
          </>
        }
      />

      {/* Key metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label="Total Deals" value={totalDeals} />
        <AdminMetric label="Pipeline Value" value={`£${totalValue.toLocaleString()}`} />
        <AdminMetric label="Total Contacts" value={contacts.total} />
      </div>

      {/* Kanban board */}
      <Panel variant="default" padding="none">
        <div className="px-4 py-3 border-b border-admin-border">
          <h2 className="text-sm font-semibold text-admin-text">Deal Pipeline</h2>
        </div>
        <div className="flex overflow-x-auto gap-px bg-admin-border">
          {allStages.length === 0 ? (
            <div className="flex-1 bg-admin-panel p-8 text-center text-sm text-admin-text-muted">
              No pipeline configured yet. Create a pipeline to start tracking deals.
            </div>
          ) : (
            allStages.map((stage) => {
              const stageValue = stage.deals.reduce(
                (a: number, d: any) => a + Number(d.amount ?? 0),
                0
              );
              return (
                <div
                  key={stage.id}
                  className="flex-1 min-w-[200px] bg-admin-panel p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                      {stage.name}
                    </h3>
                    <span className="text-[10px] text-admin-text-muted">
                      {stage.deals.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-[10px] text-admin-text-muted">
                      £{stageValue.toLocaleString()}
                    </p>
                  )}
                  <div className="space-y-1.5 mt-2">
                    {stage.deals.map((deal: any) => (
                      <div
                        key={deal.id}
                        className="rounded-md border border-admin-border bg-admin-elevated p-2.5 hover:border-admin-border-strong transition-colors"
                      >
                        <p className="text-xs font-medium text-admin-text truncate">
                          {deal.name}
                        </p>
                        {deal.amount ? (
                          <p className="text-[10px] text-admin-accent mt-0.5">
                            £{Number(deal.amount).toLocaleString()}
                          </p>
                        ) : null}
                        {deal.contact && (
                          <p className="text-[10px] text-admin-text-muted mt-0.5 truncate">
                            {deal.contact.firstName} {deal.contact.lastName}
                          </p>
                        )}
                      </div>
                    ))}
                    {stage.deals.length === 0 && (
                      <p className="text-[10px] text-admin-text-muted text-center py-3 italic">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>

      {/* Two column: contacts + activity */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel variant="default" padding="none" className="xl:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Recent Contacts</h2>
            <AdminButton href="/dashboard/crm/contacts" variant="ghost" size="sm">
              View all
            </AdminButton>
          </div>
          <div className="divide-y divide-admin-border">
            {contacts.items.map((contact: any) => (
              <Link
                key={contact.id}
                href={`/dashboard/crm/contacts/${contact.id}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-admin-accent/10 text-[10px] font-semibold text-admin-accent">
                    {contact.firstName?.[0]}{contact.lastName?.[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-admin-text truncate group-hover:text-admin-accent transition-colors">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-admin-text-muted truncate">{contact.email}</p>
                  </div>
                </div>
                <AdminBadge variant="accent">{contact.lifecycleStage.replace(/_/g, " ")}</AdminBadge>
              </Link>
            ))}
            {contacts.items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">
                No contacts yet.
              </p>
            )}
          </div>
        </Panel>

        <Panel variant="default" padding="none">
          <div className="px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Activity Feed</h2>
          </div>
          <div className="divide-y divide-admin-border max-h-80 overflow-y-auto">
            {activities.map((activity: any) => (
              <div key={activity.id} className="px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2">
                  <AdminBadge variant="accent">{activity.type}</AdminBadge>
                </div>
                <p className="text-sm text-admin-text mt-1">{activity.subject}</p>
                <p className="text-xs text-admin-text-muted">
                  {activity.contact
                    ? `${activity.contact.firstName} ${activity.contact.lastName}`
                    : "Unassigned"}
                </p>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">
                No activity yet.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
