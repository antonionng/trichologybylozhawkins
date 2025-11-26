import {
  listAudiences,
  listAutomations,
  listCampaigns,
} from "@/server/modules/email/service";
import { Surface } from "@/components/layout/Surface";
import { AudienceForm } from "@/components/dashboard/email/AudienceForm";
import { CampaignForm } from "@/components/dashboard/email/CampaignForm";
import { AutomationForm } from "@/components/dashboard/email/AutomationForm";

export default async function EmailDashboard() {
  const [audiences, campaigns, automations] = await Promise.all([
    listAudiences(),
    listCampaigns(),
    listAutomations(),
  ]);

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Lifecycle Messaging
          </p>
          <h1 className="text-2xl font-semibold text-black">
            Campaigns & Automations
          </h1>
          <p className="text-sm text-black/60">
            Coordinate launch sequences, enquiry nurtures, and retention loops across the Bunny at
            Home journey.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Surface variant="card" padding="lg" className="bg-white/80">
            <h2 className="text-lg font-semibold text-black">New audience</h2>
            <p className="mt-1 text-xs text-black/60">
              Define a cohort for triggered journeys or tailored campaigns.
            </p>
            <div className="mt-4">
              <AudienceForm />
            </div>
          </Surface>
          <Surface variant="card" padding="lg" className="bg-white/80 lg:col-span-2">
            <h2 className="text-lg font-semibold text-black">Campaign builder</h2>
            <p className="mt-1 text-xs text-black/60">
              Launch a premium announcement or nurture drip. Schedule send or keep in draft.
            </p>
            <div className="mt-4">
              <CampaignForm audiences={audiences.map((audience) => ({ id: audience.id, name: audience.name }))} />
            </div>
          </Surface>
        </div>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface variant="card" padding="lg" className="bg-white/80 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">Live campaigns</p>
              <h2 className="text-xl font-semibold text-black">Status board</h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-black/40">
                <tr>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Audience</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="rounded-lg bg-white/65 text-black">
                    <td className="px-3 py-2 font-medium">{campaign.name}</td>
                    <td className="px-3 py-2 text-black/70">{campaign.audience.name}</td>
                    <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                      {campaign.status}
                    </td>
                    <td className="px-3 py-2 text-black/60">
                      {campaign.scheduledFor
                        ? campaign.scheduledFor.toLocaleString()
                        : "Not scheduled"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 ? (
              <p className="mt-4 text-sm text-black/60">
                No campaigns yet. Draft your first announcement to rally your learners.
              </p>
            ) : null}
          </div>
        </Surface>
        <Surface variant="glass" padding="lg" className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Automations
            </p>
            <h2 className="text-xl font-semibold text-black">Enquiry nurture</h2>
          </div>
          <AutomationForm audiences={audiences.map((audience) => ({ id: audience.id, name: audience.name }))} />
          <div className="space-y-3 text-sm text-black/70">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="rounded-lg border border-black/5 bg-white/60 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                  {automation.status}
                </p>
                <p className="mt-1 font-medium text-black">{automation.name}</p>
                <p className="text-xs text-black/60">
                  {automation.steps.length} step journey • Trigger:{" "}
                  {automation.triggerType.toLowerCase()}
                </p>
              </div>
            ))}
            {automations.length === 0 ? (
              <p className="text-xs text-black/60">
                Activate your first automation to follow up enquiries within minutes.
              </p>
            ) : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}

