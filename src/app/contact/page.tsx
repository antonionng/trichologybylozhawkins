'use client';

import { useState } from "react";
import Image from "next/image";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";
import { ButtonLink, Button } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import { EnquiryForm } from "@/components/contact/EnquiryForm";

const responseInsights = [
  { value: "24–48h", label: "Response time" },
  { value: "Mon–Thu", label: "Consultation days" },
  { value: "UK, EU & US", label: "Main regions" },
];

const enquiryTracks = [
  {
    title: "Training & salon partnerships",
    description:
      "Interested in courses, team training, or salon workshops? We'll help you choose the right option and plan delivery for your team.",
    bulletPoints: [
      "Video courses with instant access",
      "In-person workshops in London or at your salon",
      "Ongoing support and business guidance",
    ],
    primaryCta: {
      label: "Discuss training options",
      href: "mailto:hello@lorrainehawkins.com?subject=Education%20partnership",
    },
    secondaryCta: { label: "View all courses", href: "/education#video-library" },
  },
  {
    title: "Personal consultations",
    description:
      "Looking for expert help with your scalp or hair health? Book a consultation to get a professional assessment and treatment plan.",
    bulletPoints: [
      "Professional scalp imaging and analysis",
      "Personalized treatment and product recommendations",
      "Referrals to specialists if needed",
    ],
    primaryCta: { label: "Book consultation", href: "mailto:hello@lorrainehawkins.com?subject=Clinic%20consultation" },
    secondaryCta: { label: "Learn about services", href: "/services" },
  },
];

const resourcePrompts = [
  {
    title: "Course catalog",
    description: "Browse all available video courses, see what's included, and find pricing information.",
    href: "/education#video-library",
  },
  {
    title: "Consultation guide",
    description: "Learn what happens in your first appointment and how to prepare for the best results.",
    href: "/services",
  },
];

const contactFaqs = [
  {
    question: "Can Lorraine come to our location for training?",
    answer:
      "Yes! Lorraine travels for in-person training across the UK, Europe, North America, and the Middle East. We'll discuss travel and logistics when you book.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Payment options are available for both individual clients and salon teams. We'll explain all options during your initial consultation.",
  },
  {
    question: "How many people can attend a workshop?",
    answer:
      "Workshops work best with 4-15 participants, but we can accommodate larger teams across multiple sessions if needed.",
  },
];

const officeHours = [
  { label: "Consultations", detail: "Mon & Wed · 10am–5pm GMT" },
  { label: "Training", detail: "Tue–Thu · 9am–6pm GMT" },
  { label: "Email", detail: "Monitored daily · urgent calls welcome" },
];

export default function Contact() {
  const [isEnquiryFormOpen, setIsEnquiryFormOpen] = useState(false);

  return (
    <main>
      <EnquiryForm isOpen={isEnquiryFormOpen} onClose={() => setIsEnquiryFormOpen(false)} />
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Contact"
              title="Get in touch"
              description="Whether you need personal scalp care, team training, or speaking engagements, let us know how we can help."
            />
            <div className="flex flex-wrap gap-4 text-sm text-brand-graphite/75">
              <a href="mailto:hello@lorrainehawkins.com" className="underline decoration-brand-salmon/40 underline-offset-4">
                hello@lorrainehawkins.com
              </a>
              <span className="hidden text-brand-graphite/30 sm:block">•</span>
              <a href="tel:+442012345678" className="underline decoration-brand-salmon/40 underline-offset-4">
                +44 (0)20 1234 5678
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="md" onClick={() => setIsEnquiryFormOpen(true)}>
                Send enquiry
              </Button>
              <ButtonLink href="/education#video-library" variant="ghost" size="md">
                View courses
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {responseInsights.map((metric) => (
                <Surface
                  key={metric.label}
                  variant="subtle"
                  padding="lg"
                  className="flex flex-col gap-1 text-brand-graphite"
                >
                  <span className="font-display text-2xl">{metric.value}</span>
                  <span className="text-sm uppercase tracking-[0.28em] text-brand-graphite/65">{metric.label}</span>
                </Surface>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Surface variant="glass" padding="none" className="overflow-hidden rounded-glass-lg">
              <Image
                src={photography.salonTeam.src}
                alt={photography.salonTeam.alt}
                width={600}
                height={780}
                className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                priority
              />
            </Surface>
            <Surface variant="card" padding="lg" className="space-y-3 text-sm leading-relaxed text-brand-graphite/78">
              <p className="font-semibold text-brand-graphite">Want to talk first?</p>
              <p>Book a 30-minute call to discuss your needs and get personalized recommendations.</p>
              <Button variant="secondary" size="md" onClick={() => setIsEnquiryFormOpen(true)}>
                Request a call
              </Button>
            </Surface>
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="What are you looking for?"
            title="Choose what fits your needs"
            description="Tell us about your situation so we can provide the most helpful information and guidance."
            align="center"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            {enquiryTracks.map((track) => (
              <Surface key={track.title} variant="card" padding="lg" className="flex h-full flex-col gap-5">
                <h3 className="font-display text-2xl text-brand-graphite">{track.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{track.description}</p>
                <ul className="space-y-2 text-sm leading-relaxed text-brand-graphite/75">
                  {track.bulletPoints.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon/40" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsEnquiryFormOpen(true)}
                  >
                    {track.primaryCta.label}
                  </Button>
                  <ButtonLink href={track.secondaryCta.href} variant="ghost" size="md">
                    {track.secondaryCta.label}
                  </ButtonLink>
                </div>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="mist" texture="veined">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Resources"
            title="Learn more before you reach out"
            description="Browse helpful information about courses and consultations to help you decide what's right for you."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2">
            {resourcePrompts.map((resource) => (
              <Surface key={resource.title} variant="card" padding="lg" className="space-y-3">
                <h3 className="font-display text-xl text-brand-graphite">{resource.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{resource.description}</p>
                <ButtonLink href={resource.href} variant="ghost" size="md" className="w-fit">
                  View resource
                </ButtonLink>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="mist" texture="veined">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Availability"
            title="When we're available"
            description="We work with people worldwide. Choose in-person or video call consultations based on what works for you."
            align="center"
          />
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-3">
              {officeHours.map((entry, index) => (
                <Surface 
                  key={entry.label} 
                  variant="glass" 
                  padding="lg" 
                  className="group relative overflow-hidden border border-brand-salmon/10 transition-all duration-300 hover:border-brand-salmon/30 hover:shadow-card"
                >
                  {/* Decorative accent */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-salmon/60 to-brand-salmon/20" />
                  
                  <div className="space-y-4">
                    {/* Number indicator */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-salmon/10 text-brand-salmon transition-all group-hover:bg-brand-salmon/20">
                      <span className="font-display text-xl font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-display text-xl text-brand-graphite">
                        {entry.label}
                      </h3>
                      <p className="text-sm leading-relaxed text-brand-graphite/75">
                        {entry.detail}
                      </p>
                    </div>
                  </div>
                </Surface>
              ))}
            </div>
            
            {/* Additional info card */}
            <Surface 
              variant="card" 
              padding="lg" 
              className="mt-8 border border-brand-salmon/10 bg-white/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="space-y-2">
                  <h4 className="font-display text-lg text-brand-graphite">
                    Working across time zones
                  </h4>
                  <p className="text-sm leading-relaxed text-brand-graphite/75">
                    We accommodate clients in the UK, Europe, North America, and beyond. 
                    Let us know your preferred time and we'll find a slot that works.
                  </p>
                </div>
              </div>
            </Surface>
          </div>
        </Container>
      </PageSection>

      <PageSection tone="sand" texture="linen">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="FAQs"
            title="Common questions"
            description="Quick answers to help you decide. Include any other questions in your enquiry."
            align="center"
          />
          <div className="space-y-4">
            {contactFaqs.map((faq) => (
              <Surface key={faq.question} variant="card" padding="lg" className="space-y-2">
                <h3 className="font-display text-lg text-brand-graphite">{faq.question}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{faq.answer}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>
    </main>
  );
}
