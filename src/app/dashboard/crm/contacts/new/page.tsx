export const dynamic = "force-dynamic";

import { Surface } from "@/components/layout/Surface";
import { ContactUpsertForm } from "@/components/dashboard/crm/ContactUpsertForm";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">CRM</p>
        <h1 className="text-2xl font-semibold text-black">New Contact</h1>
        <p className="text-sm text-black/60">Create a contact and start logging activity.</p>
      </Surface>

      <Surface variant="card" padding="lg">
        <ContactUpsertForm mode="create" />
      </Surface>
    </div>
  );
}



