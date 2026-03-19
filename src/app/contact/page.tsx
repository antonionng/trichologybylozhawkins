'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ButtonLink, Button } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { mailtoWithSubject, siteContact, siteContactLinks } from "@/lib/siteContact";
import { buildScalpQuizContactPrefill } from "@/lib/scalpQuizContactPrefill";

const responseInsights = [
  { value: "24–48h", label: "Response" },
  { value: "Wed–Thu", label: "Consultations" },
  { value: "UK, EU & US", label: "Regions" },
];

const enquiryTracks = [
  {
    icon: (
      <svg className="h-4 w-4 text-brand-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
    ),
    badge: "Training",
    badgeClass: "bg-brand-sage/15 text-brand-graphite/55",
    borderClass: "border-brand-sage/20",
    title: "Training & salon partnerships",
    description: "Interested in courses, team training, or salon workshops?",
    bullets: ["Video courses with instant access", "In-person workshops", "Ongoing support"],
    secondaryHref: "/education",
    secondaryLabel: "View courses",
  },
  {
    icon: (
      <svg className="h-4 w-4 text-brand-salmon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
    ),
    badge: "Consultations",
    badgeClass: "bg-brand-salmon/10 text-brand-salmon",
    borderClass: "border-brand-salmon/15",
    title: "Clinical consultations",
    description: "Expert clinical assessment with Lorraine, or case review and mentorship for practitioners.",
    bullets: ["Professional scalp imaging", "Personalised treatment plan", "Specialist referrals if needed"],
    secondaryHref: "/services",
    secondaryLabel: "Learn about services",
  },
];

const contactFaqs = [
  { q: "Can Lorraine come to our location?", a: "Yes — UK, Europe, North America, and the Middle East. We'll discuss logistics when you book." },
  { q: "Do you offer payment plans?", a: "Payment options available for individuals and salon teams. We'll explain during your initial consultation." },
  { q: "How many can attend a workshop?", a: "4-15 participants ideal, but we can accommodate larger teams across multiple sessions." },
];

const officeHours = [
  { label: "Consultations", detail: "Wed & Thu · 10am–5pm GMT" },
  { label: "Training", detail: "Mon & Tue · 9am–6pm GMT" },
  { label: "Email", detail: "Monitored daily" },
];

export default function Contact() {
  const [isEnquiryFormOpen, setIsEnquiryFormOpen] = useState(false);
  const searchParams = useSearchParams();
  const quizPrefill = useMemo(() => buildScalpQuizContactPrefill(searchParams), [searchParams]);

  useEffect(() => {
    if (quizPrefill?.shouldAutoOpen) {
      setIsEnquiryFormOpen(true);
    }
  }, [quizPrefill]);

  return (
    <main className="min-h-screen">
      <EnquiryForm
        isOpen={isEnquiryFormOpen}
        onClose={() => setIsEnquiryFormOpen(false)}
        initialData={
          quizPrefill
            ? {
                enquiryType: quizPrefill.enquiryType,
                message: quizPrefill.message,
                urgency: quizPrefill.urgency,
                source: quizPrefill.source,
              }
            : undefined
        }
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">Contact</span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">
                {quizPrefill ? "Continue your scalp consultation request" : "Get in touch"}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-brand-graphite/65">
                {quizPrefill
                  ? "We have opened a clinic enquiry for you with your quiz context prefilled. Review it, add any extra details, and send it through to Lorraine."
                  : "Personal scalp care, team training, or speaking engagements. Let us know how we can help."}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-brand-graphite/60">
                <a href={siteContactLinks.mailto} className="underline decoration-brand-salmon/40 underline-offset-4 hover:text-brand-graphite">{siteContact.email}</a>
                <span className="hidden text-brand-graphite/20 sm:block">&bull;</span>
                <a href={siteContactLinks.tel} className="underline decoration-brand-salmon/40 underline-offset-4 hover:text-brand-graphite">{siteContact.phoneDisplay}</a>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={() => setIsEnquiryFormOpen(true)}>
                  {quizPrefill ? "Continue booking request" : "Send enquiry"}
                </Button>
                <ButtonLink href="/education/videos" variant="ghost" size="sm">View courses</ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {responseInsights.map((m) => (
                  <div key={m.label} className="rounded-xl border border-brand-graphite/8 bg-white p-3 text-center">
                    <p className="font-display text-lg text-brand-graphite">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-brand-graphite/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl">
                <Image src={photography.salonTeam.src} alt={photography.salonTeam.alt} width={600} height={780} className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]" priority />
              </div>
              <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-2">
                <p className="text-xs font-bold text-brand-graphite">Want to talk first?</p>
                <p className="text-sm text-brand-graphite/55">
                  {quizPrefill ? "Your scalp quiz details are ready to send through to Lorraine." : "Book a 15-minute call to discuss your needs."}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setIsEnquiryFormOpen(true)}>
                  {quizPrefill ? "Open your enquiry" : "Request a 15-minute call"}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Enquiry tracks ────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12">
        <Container>
          <div className="mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">How can we help?</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">Choose what fits</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {enquiryTracks.map((track) => (
              <div key={track.title} className={`flex flex-col gap-4 rounded-2xl border ${track.borderClass} bg-white p-5 shadow-sm`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-graphite/5">{track.icon}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${track.badgeClass}`}>{track.badge}</span>
                </div>
                <h3 className="font-display text-lg text-brand-graphite">{track.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/60">{track.description}</p>
                <ul className="space-y-1.5">
                  {track.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-xs text-brand-graphite/50">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-salmon/50" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 mt-auto">
                  <Button variant="secondary" size="sm" onClick={() => setIsEnquiryFormOpen(true)}>
                    {track.title === "Clinical consultations" ? "Book consultation" : "Discuss training"}
                  </Button>
                  <ButtonLink href={track.secondaryHref} variant="ghost" size="sm">{track.secondaryLabel}</ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Availability + FAQs merged ────────────────────────────────── */}
      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/15 via-brand-sand/20 to-white py-10 sm:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* Availability */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">Availability</span>
              <h2 className="mt-1 mb-4 font-display text-xl text-brand-graphite">When we&rsquo;re available</h2>
              <div className="space-y-3">
                {officeHours.map((h, i) => (
                  <div key={h.label} className="flex items-center gap-3 rounded-xl border border-brand-graphite/8 bg-white p-3 shadow-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-salmon/10 text-xs font-bold text-brand-salmon">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-brand-graphite">{h.label}</p>
                      <p className="text-xs text-brand-graphite/50">{h.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-brand-graphite/40">We work across time zones — UK, Europe, and North America. Let us know your preference.</p>
            </div>

            {/* FAQs */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">FAQs</span>
              <h2 className="mt-1 mb-4 font-display text-xl text-brand-graphite">Common questions</h2>
              <div className="space-y-3">
                {contactFaqs.map((faq) => (
                  <div key={faq.q} className="rounded-xl border border-brand-graphite/8 bg-white p-4 shadow-sm space-y-1">
                    <p className="text-sm font-semibold text-brand-graphite">{faq.q}</p>
                    <p className="text-sm leading-relaxed text-brand-graphite/55">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Resources strip ───────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/education/videos" className="group flex items-center gap-4 rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-salmon/10">
                <svg className="h-5 w-5 text-brand-salmon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-graphite group-hover:text-brand-salmon transition-colors">Course catalog</p>
                <p className="text-xs text-brand-graphite/50">Browse all video courses and pricing</p>
              </div>
            </a>
            <a href="/services" className="group flex items-center gap-4 rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-sage/12">
                <svg className="h-5 w-5 text-brand-sage" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-graphite group-hover:text-brand-sage transition-colors">Consultation guide</p>
                <p className="text-xs text-brand-graphite/50">What happens in your first appointment</p>
              </div>
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
