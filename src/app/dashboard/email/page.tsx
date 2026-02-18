export const dynamic = "force-dynamic";

import {
  listAudiences,
  listAutomations,
  listCampaigns,
} from "@/server/modules/email/service";
import { EmailDashboardClient } from "@/components/dashboard/email/EmailDashboardClient";

export default async function EmailDashboard() {
  const [audiences, campaigns, automations] = await Promise.all([
    listAudiences(),
    listCampaigns(),
    listAutomations(),
  ]);

  return (
    <EmailDashboardClient
      audiences={audiences as any}
      campaigns={campaigns as any}
      automations={automations as any}
    />
  );
}
