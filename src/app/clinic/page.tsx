import { ClinicPageView } from "@/components/clinic/ClinicPageView";
import { clinicPageMetadata } from "@/lib/clinicPageMeta";

export const metadata = clinicPageMetadata;

export default function ClinicPage() {
  return <ClinicPageView />;
}
