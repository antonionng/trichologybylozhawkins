export const dynamic = "force-dynamic";

import {
  listAudiences,
  listAutomations,
  listCampaigns,
} from "@/server/modules/email/service";
import { getOperationalAdminRecipients } from "@/server/modules/settings/notifications";
import { requireUserOrRedirect } from "@/server/security/auth";
import { EmailDashboardClient } from "@/components/dashboard/email/EmailDashboardClient";

export default async function EmailDashboard() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/email" });

  const [audiences, campaigns, automations, adminNotificationEmails] = await Promise.all([
    listAudiences(),
    listCampaigns(),
    listAutomations(),
    getOperationalAdminRecipients(),
  ]);

  return (
    <EmailDashboardClient
      audiences={audiences as any}
      campaigns={campaigns as any}
      automations={automations as any}
      adminNotificationEmails={adminNotificationEmails}
    />
  );
}
