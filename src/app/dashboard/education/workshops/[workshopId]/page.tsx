export const dynamic = "force-dynamic";

import { getWorkshopById } from "@/app/actions/education";
import { WorkshopEditor } from "@/components/dashboard/education/WorkshopEditor";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { notFound } from "next/navigation";

interface Props {
  params: { workshopId: string };
}

export default async function WorkshopEditorPage({ params }: Props) {
  const workshop = await getWorkshopById(params.workshopId);
  if (!workshop) notFound();

  const heroUrl = (workshop as any).heroMedia?.path
    ? await createSignedDownloadUrl((workshop as any).heroMedia.path)
    : null;

  return <WorkshopEditor workshop={workshop} heroUrl={heroUrl} />;
}
