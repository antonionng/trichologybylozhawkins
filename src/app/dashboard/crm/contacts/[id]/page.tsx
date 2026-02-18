export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
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
      <Surface variant="glass" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">CRM</p>
        <h1 className="text-2xl font-semibold text-black">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="text-sm text-black/60">{contact.email}</p>
      </Surface>

      <ContactRecordClient initialContact={safeContact} />
    </div>
  );
}


