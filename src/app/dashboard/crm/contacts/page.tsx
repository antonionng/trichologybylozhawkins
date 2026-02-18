export const dynamic = "force-dynamic";

import { listContacts } from "@/server/modules/crm/service";
import { Surface } from "@/components/layout/Surface";
import { ContactsIndexClient } from "@/components/dashboard/crm/ContactsIndexClient";
import type { LifecycleStage } from "@prisma/client";

type SearchParams = {
  page?: string;
  pageSize?: string;
  search?: string;
  company?: string;
  lifecycleStage?: LifecycleStage;
  companyId?: string;
  ownerId?: string;
  view?: "cards" | "table";
};

export default async function CrmContactsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ?? {};
  const page = Number(params.page ?? "1");
  const pageSize = Number(params.pageSize ?? "20");

  const result = await listContacts({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    search: params.search || undefined,
    company: params.company || undefined,
    lifecycleStage: params.lifecycleStage || undefined,
    companyId: params.companyId || undefined,
    ownerId: params.ownerId || undefined,
  });
  const safeResult = JSON.parse(JSON.stringify(result)) as typeof result;

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">CRM</p>
        <h1 className="text-2xl font-semibold text-black">Contacts</h1>
        <p className="text-sm text-black/60">
          Search, filter, and open a full HubSpot-style record for every contact.
        </p>
      </Surface>

      <ContactsIndexClient
        initialResult={safeResult}
        initialQuery={{
          page: safeResult.page,
          pageSize: safeResult.pageSize,
          search: params.search ?? "",
          company: params.company ?? "",
          lifecycleStage: params.lifecycleStage ?? "",
          companyId: params.companyId ?? "",
          ownerId: params.ownerId ?? "",
          view: params.view ?? "cards",
        }}
      />
    </div>
  );
}


