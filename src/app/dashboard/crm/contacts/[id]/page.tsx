export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { ContactRecordClient } from "@/components/dashboard/crm/ContactRecordClient";
import { getContactById } from "@/server/modules/crm/service";

export default async function ContactRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const contact = await getContactById(id);

  if (!contact) notFound();
  const safeContact = JSON.parse(JSON.stringify(contact)) as typeof contact;

  return (
    <div className="space-y-6">
      <Panel variant="elevated" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-admin-text-muted">CRM</p>
        <h1 className="text-2xl font-semibold text-admin-text">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="text-sm text-admin-text-secondary">{contact.email}</p>
      </Panel>

      <ContactRecordClient initialContact={safeContact} />
    </div>
  );
}


