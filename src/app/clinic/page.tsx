import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import {
  formatClinicAddress,
  siteContact,
  siteContactLinks,
} from "@/lib/siteContact";
import { FEATURED_PUBLIC_QUIZ_HREF, FEATURED_PUBLIC_QUIZ_LABEL } from "@/lib/publicQuiz";
import { buildClinicJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/clinic",
  title: "Knutsford trichology clinic",
  description:
    "In-person hair and scalp consultations with Lorraine Hawkins at 27 Regent Street, Knutsford. Enquire by form, email, or phone — replies within 24–48 hours.",
  keywords: [
    "trichology clinic knutsford",
    "hair loss consultation knutsford",
    "scalp consultation cheshire",
    "lorraine hawkins clinic",
  ],
});

const visitFacts = [
  { value: siteContact.consultationHoursShort, label: "Consultation hours" },
  { value: siteContact.enquiryResponseLabel, label: "Enquiry reply" },
  { value: "Knutsford", label: "In person" },
];

const consultSteps = [
  {
    n: "1",
    title: "Send an enquiry or call",
    description:
      "There is no online calendar. Use the enquiry form, email, or phone. Lorraine or the team reply within 24–48 hours to arrange a time.",
  },
  {
    n: "2",
    title: "History and scalp assessment",
    description:
      "The visit covers what you have noticed, relevant health history, and a structured scalp assessment. Imaging is used when it helps the picture.",
  },
  {
    n: "3",
    title: "A clear plan",
    description:
      "You leave with an explanation in plain language and a care plan. If something sits outside trichology, Lorraine will say so and can signpost onwards.",
  },
];

export default function ClinicPage() {
  const address = formatClinicAddress();

  return (
    <main className="min-h-screen">
      <JsonLd data={buildClinicJsonLd()} />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">
                Clinic
              </span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                Hair and scalp consultations in Knutsford
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-brand-graphite/65">
                Lorraine Hawkins sees people with hair-loss and scalp concerns in person at{" "}
                {address}. This is a consultation, not a course catalogue. Training for stylists
                and salon teams lives on the Academy side of the site.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <ButtonLink href="/contact?service=clinic" variant="secondary" size="sm">
                  Request a consultation
                </ButtonLink>
                <ButtonLink href={siteContactLinks.tel} variant="ghost" size="sm">
                  Call {siteContact.phoneDisplay}
                </ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {visitFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl border border-brand-graphite/8 bg-white p-3 text-center"
                  >
                    <p className="font-display text-sm text-brand-graphite sm:text-base">{fact.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-brand-graphite/40">
                      {fact.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={photography.consultation.src}
                  alt={photography.consultation.alt}
                  width={600}
                  height={780}
                  className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                  priority
                />
              </div>
              <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-graphite/40">
                  Visit
                </p>
                <p className="text-sm font-semibold text-brand-graphite">{address}</p>
                <p className="text-sm text-brand-graphite/55">
                  Consultations: {siteContact.consultationDaysLabel}, {siteContact.consultationHoursLabel}.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={siteContactLinks.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline decoration-brand-salmon/40 underline-offset-4 hover:text-brand-graphite"
                  >
                    Open in Google Maps
                  </a>
                  <a
                    href={siteContactLinks.mailto}
                    className="text-sm underline decoration-brand-salmon/40 underline-offset-4 hover:text-brand-graphite"
                  >
                    {siteContact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container>
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">
              Booking
            </span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">
              How to arrange a visit
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-brand-graphite/60">
              Booking is by enquiry, not a self-serve calendar. Fees are confirmed when a time is
              arranged — they are not listed here.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {consultSteps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col gap-3 rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-salmon text-xs font-bold text-white">
                  {step.n}
                </span>
                <h3 className="font-display text-base text-brand-graphite">{step.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/55">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact?service=clinic" variant="secondary" size="sm">
              Send a clinic enquiry
            </ButtonLink>
            <ButtonLink href={FEATURED_PUBLIC_QUIZ_HREF} variant="ghost" size="sm">
              {FEATURED_PUBLIC_QUIZ_LABEL}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/15 via-brand-sand/20 to-white py-10 sm:py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">
                Address
              </span>
              <h2 className="font-display text-xl text-brand-graphite">27 Regent Street, Knutsford</h2>
              <p className="text-sm leading-relaxed text-brand-graphite/60">
                {siteContact.streetAddress}, {siteContact.addressLocality}, {siteContact.addressRegion},{" "}
                {siteContact.postalCode}.
              </p>
              <p className="text-sm text-brand-graphite/60">
                Phone{" "}
                <a href={siteContactLinks.tel} className="underline decoration-brand-salmon/40 underline-offset-4">
                  {siteContact.phoneDisplay}
                </a>
              </p>
              <ButtonLink href={siteContactLinks.maps} variant="ghost" size="sm" className="w-fit">
                Directions
              </ButtonLink>
            </div>
            <div className="rounded-2xl border border-brand-sage/20 bg-white p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">
                Academy
              </span>
              <h2 className="font-display text-xl text-brand-graphite">
                Looking for professional training?
              </h2>
              <p className="text-sm leading-relaxed text-brand-graphite/60">
                The Trichology Academy is the education side of the same practice: video modules,
                courses, and in-person workshops for stylists and salon teams.
              </p>
              <ButtonLink href="/education" variant="ghost" size="sm" className="w-fit">
                Explore training
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
