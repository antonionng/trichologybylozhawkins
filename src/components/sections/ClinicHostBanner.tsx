import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatClinicAddress } from "@/lib/siteContact";

export function ClinicHostBanner() {
  return (
    <div className="border-b border-brand-graphite/10 bg-brand-sand/90">
      <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-brand-graphite">
            Hair and scalp consultations in Knutsford
          </p>
          <p className="text-sm text-brand-graphite/65">
            {formatClinicAddress()}. Academy training for hair professionals is on the same site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/clinic" variant="secondary" size="sm">
            Clinic details
          </ButtonLink>
          <ButtonLink href="/contact?service=clinic" variant="ghost" size="sm">
            Request a consult
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
