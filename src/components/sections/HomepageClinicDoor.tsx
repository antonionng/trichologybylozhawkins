import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatClinicAddress, siteContact } from "@/lib/siteContact";
import { FEATURED_PUBLIC_QUIZ_HREF, FEATURED_PUBLIC_QUIZ_LABEL } from "@/lib/publicQuiz";

export function HomepageClinicDoor() {
  return (
    <section className="border-y border-brand-graphite/8 bg-white">
      <Container className="py-8 sm:py-10">
        <div className="rounded-2xl border border-brand-graphite/8 bg-brand-sand/40 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-graphite/40">
                Personal consultations
              </p>
              <h2 className="font-display text-2xl text-brand-graphite">
                Not a hair professional?
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-graphite/65">
                If you want a scalp check or a hair-loss consultation, Lorraine sees clients in
                person at {formatClinicAddress()}. Booking is by enquiry or phone — there is no online calendar —
                and the team replies within {siteContact.enquiryResponseLabel}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink href="/clinic" variant="secondary" size="sm">
                Knutsford clinic
              </ButtonLink>
              <ButtonLink href={FEATURED_PUBLIC_QUIZ_HREF} variant="ghost" size="sm">
                {FEATURED_PUBLIC_QUIZ_LABEL}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
