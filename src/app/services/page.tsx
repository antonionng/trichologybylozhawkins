import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Container } from "@/components/layout/Container";
import { services } from "@/lib/content";
import { photography } from "@/lib/visualAssets";
import { formatClinicAddress, siteContact } from "@/lib/siteContact";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/services",
  title: "Trichology Services",
  description:
    "Book clinical trichology consultations, scalp assessments, and salon team training with Lorraine Hawkins.",
  keywords: [
    "trichology consultation",
    "scalp assessment",
    "salon team training",
    "hair loss consultation uk",
  ],
});

const serviceMetrics = [
  { value: "18+", label: "Years" },
  { value: "Trusted", label: "By salons" },
  { value: "30+", label: "Sessions / year" },
];

const processSteps = [
  { n: "1", title: "Assessment", description: "Scalp imaging, health history, and comprehensive intake.", color: "bg-rose-400" },
  { n: "2", title: "Planning", description: "Custom treatment plan with product and lifestyle guidance.", color: "bg-amber-400" },
  { n: "3", title: "Hands-on care", description: "Guided demonstrations, technique refinement, and practice.", color: "bg-emerald-400" },
  { n: "4", title: "Ongoing support", description: "Progress reviews, adjustments, and continued guidance.", color: "bg-sky-400" },
];

const conciergeAssurances = [
  "Personal scheduling and logistics support",
  "Flexible payment options",
  "Secure, confidential records",
  "Specialist referrals when needed",
];

export default function Services() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">Services</span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                Consultations &amp; professional training
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-brand-graphite/65">
                Personal scalp health consultations at {formatClinicAddress()}. Hands-on training for salon teams and practitioners. All led by Lorraine.
              </p>
              <p className="text-sm text-brand-graphite/55">
                Consultations {siteContact.consultationHoursShort}. Booking is by enquiry, not an online calendar.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <ButtonLink href="/clinic" variant="secondary" size="sm">Knutsford clinic</ButtonLink>
                <ButtonLink href="/education" variant="ghost" size="sm">Train your team</ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {serviceMetrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-brand-graphite/8 bg-white p-3 text-center">
                    <p className="font-display text-lg text-brand-graphite">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-brand-graphite/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl">
                <Image src={photography.consultation.src} alt={photography.consultation.alt} width={600} height={780} className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]" priority />
              </div>
              <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-graphite/40">Personalised support</p>
                <ul className="space-y-1.5 text-sm text-brand-graphite/55">
                  {conciergeAssurances.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-salmon" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Two service tracks ───────────────────────────────────────── */}
      <section className="py-10 sm:py-12">
        <Container>
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">Services</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">Education &amp; clinical services</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-brand-sage/20 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage/15">
                  <svg className="h-4 w-4 text-brand-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
                </span>
              </div>
              <h3 className="font-display text-lg text-brand-graphite">Clinical consultations &amp; training</h3>
              <p className="text-sm leading-relaxed text-brand-graphite/60">One-to-one assessments, team training for salon staff, and hands-on workshops for practitioners.</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <div key={s.id} className="rounded-xl border border-brand-graphite/6 bg-brand-mist/10 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-graphite">{s.name}</p>
                      <span className="text-[10px] text-brand-graphite/40">{s.duration}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-brand-graphite/55">{s.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.focus.map((f) => (
                        <span key={f} className="rounded-full bg-brand-sage/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-brand-graphite/50">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-auto">
                <ButtonLink href="/contact?service=clinic" variant="secondary" size="sm" className="w-fit">Request a consultation</ButtonLink>
                <ButtonLink href="/clinic" variant="ghost" size="sm" className="w-fit">Clinic details</ButtonLink>
                <ButtonLink href="/education#intensives" variant="ghost" size="sm" className="w-fit">Plan your training</ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Process steps ─────────────────────────────────────────────── */}
      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/15 via-brand-sand/20 to-white py-10 sm:py-12">
        <Container>
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">Process</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">A clear process from start to finish</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s) => (
              <div key={s.title} className="flex flex-col gap-3 rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${s.color} text-xs font-bold text-white shadow-sm`}>{s.n}</span>
                <h3 className="font-display text-base text-brand-graphite">{s.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/55">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <TestimonialsSection />
      <ConsultationCta />
    </main>
  );
}
