export const dynamic = "force-dynamic";

import { Panel } from "@/components/admin/Panel";
import { ContactUpsertForm } from "@/components/dashboard/crm/ContactUpsertForm";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <Panel variant="elevated" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-admin-text-muted">CRM</p>
        <h1 className="text-2xl font-semibold text-admin-text">New Contact</h1>
        <p className="text-sm text-admin-text-secondary">Create a contact and start logging activity.</p>
      </Panel>

      <Panel variant="default" padding="lg">
        <ContactUpsertForm mode="create" />
      </Panel>
    </div>
  );
}
