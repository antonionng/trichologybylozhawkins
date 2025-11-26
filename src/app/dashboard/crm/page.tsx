export const dynamic = 'force-dynamic';
import { listContacts, getPipelineBoard, listRecentActivities } from "@/server/modules/crm/service";
import { Surface } from "@/components/layout/Surface";

export default async function CrmDashboard() {
  const [pipeline, contacts, activities] = await Promise.all([
    getPipelineBoard(),
    listContacts({ page: 1, pageSize: 20 }),
    listRecentActivities(8),
  ]);

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Pipeline Overview
          </p>
          <h1 className="text-2xl font-semibold text-black">Active deal flow</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pipeline.flatMap((lane) =>
            lane.stages.map((stage) => (
              <div
                key={`${lane.id}-${stage.id}`}
                className="rounded-lg border border-black/5 bg-white/70 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  {lane.name}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-black">{stage.name}</h3>
                <p className="mt-3 text-2xl font-semibold text-[#bf7c00]">
                  {stage.deals.length}
                </p>
                <p className="text-xs text-black/50">
                  {stage.deals.length === 1 ? "Deal" : "Deals"} in stage
                </p>
              </div>
            ))
          )}
        </div>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface variant="card" padding="lg" className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">Key Contacts</p>
              <h2 className="text-xl font-semibold text-black">Recent arrivals</h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-black/40">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                {contacts.items.map((contact) => (
                  <tr key={contact.id} className="rounded-lg bg-white/70 text-black">
                    <td className="px-3 py-2 font-medium">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-3 py-2 text-black/70">{contact.email}</td>
                    <td className="px-3 py-2 text-black/70">
                      {contact.company?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                      {contact.lifecycleStage.replace(/_/g, " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contacts.items.length === 0 ? (
              <p className="mt-4 text-sm text-black/60">
                No contacts yet. Pipe enquiries through the education section or import your
                existing lists via API.
              </p>
            ) : null}
          </div>
        </Surface>
        <Surface variant="glass" padding="lg" className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Activity Feed</p>
            <h2 className="text-xl font-semibold text-black">Latest touchpoints</h2>
          </div>
          <div className="space-y-3 text-sm">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-black/5 bg-white/60 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                  {activity.type}
                </p>
                <p className="mt-1 font-medium text-black">{activity.subject}</p>
                <p className="text-xs text-black/60">
                  {activity.contact
                    ? `${activity.contact.firstName} ${activity.contact.lastName}`
                    : "Unassigned contact"}
                </p>
              </div>
            ))}
            {activities.length === 0 ? (
              <p className="text-sm text-black/60">
                Engage leads by logging calls, consults, and follow-ups to trigger automations.
              </p>
            ) : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}

