import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";
import { services } from "@/lib/content";
import { photography } from "@/lib/visualAssets";

const serviceMetrics = [
  { value: "18+", label: "years of experience" },
  { value: "1,200+", label: "clients helped" },
  { value: "30+", label: "training sessions yearly" },
];

const clinicEnhancements = [
  "Lab test coordination and biomarker analysis when needed",
  "Evidence-based treatment plans without prescriptions",
  "Personalized lifestyle, nutrition, and product recommendations",
];

const partnershipEnhancements = [
  "Initial consultation to understand your business goals",
  "Product recommendation training tailored to your offerings",
  "Ongoing support with progress reviews and guidance",
];

const processSteps = [
  {
    step: "01",
    title: "Assessment & Analysis",
    description:
      "Professional scalp imaging, health history review, and comprehensive intake assessment.",
    bullets: [
      "Detailed scalp imaging and analysis",
      "Lifestyle and health factors review",
    ],
  },
  {
    step: "02",
    title: "Treatment Planning",
    description:
      "Custom treatment plan combining professional care, home routines, and product recommendations.",
    bullets: [
      "Personalized treatment timeline",
      "Product and lifestyle recommendations",
    ],
  },
  {
    step: "03",
    title: "Hands-On Training",
    description:
      "Learn through practice with guided demonstrations, technique refinement, and real scenarios.",
    bullets: [
      "Live demonstrations and practice sessions",
      "Feedback and technique improvement",
    ],
  },
  {
    step: "04",
    title: "Ongoing Support",
    description:
      "Continued guidance with progress reviews and adjustments to keep improving results.",
    bullets: [
      "Regular progress check-ins",
      "Access to new resources and updates",
    ],
  },
];

const conciergeAssurances = [
  "Personal support with scheduling, tests, and logistics",
  "Flexible payment options for individuals and businesses",
  "Secure, confidential record-keeping",
  "Referrals to nutrition, dermatology, and wellness specialists when needed",
];

export default function Services() {
  const clinicServices = services.filter((service) => service.id === "service-consultation");
  const partnershipServices = services.filter((service) => service.id !== "service-consultation");

  return (
    <main>
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Services"
              title="Expert care and training for lasting results"
              description="Get professional scalp treatment or train your team to deliver exceptional scalp care services. Every service is backed by science and real-world experience."
            />
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Book consultation
              </ButtonLink>
              <ButtonLink href="/education" variant="ghost" size="lg">
                Train your team
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {serviceMetrics.map((metric) => (
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
                src={photography.consultation.src}
                alt={photography.consultation.alt}
                width={600}
                height={780}
                className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                priority
              />
            </Surface>
            <Surface variant="card" padding="lg" className="space-y-4 text-brand-graphite/80">
              <h3 className="font-display text-xl text-brand-graphite">Premium, personalized support</h3>
              <ul className="space-y-3 text-sm leading-relaxed">
                {conciergeAssurances.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-brand-salmon"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Surface>
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent" className="relative">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Choose your path"
            title="Personal care or team training"
            description="Get individual treatment for your scalp health or professional training for your salon team."
            align="center"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <Surface variant="card" padding="lg" className="flex h-full flex-col gap-6">
              <div className="space-y-3">
                <div className="inline-flex rounded-full bg-brand-salmon/60 px-4 py-1 text-xs uppercase tracking-[0.28em] text-brand-ivory">
                  For individuals
                </div>
                <h3 className="font-display text-2xl text-brand-graphite">Personal consultations</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">
                  Get expert scalp care with professional assessment, personalized treatment plans, and ongoing support tailored to your needs.
                </p>
              </div>
              <div className="space-y-4">
                {clinicServices.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-brand-graphite/8 bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-brand-graphite">{service.name}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/60">{service.duration}</p>
                      </div>
                      <span className="rounded-full bg-brand-salmon/60 px-3 py-1 text-xs font-medium text-brand-ivory">
                        Premium care
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-brand-graphite/75">{service.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.focus.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-brand-sage/35 px-3 py-1 text-xs uppercase tracking-[0.28em] text-brand-graphite/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <ButtonLink href={service.cta.href} variant="ghost" size="sm" className="mt-4 w-fit">
                      {service.cta.label}
                    </ButtonLink>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-brand-graphite/75">
                {clinicEnhancements.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon/40" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <ButtonLink href="/contact?service=clinic" variant="secondary" size="md" className="w-fit">
                Book your consultation
              </ButtonLink>
            </Surface>

            <Surface variant="card" padding="lg" className="flex h-full flex-col gap-6">
              <div className="space-y-3">
                <div className="inline-flex rounded-full bg-brand-sage/30 px-4 py-1 text-xs uppercase tracking-[0.28em] text-brand-graphite/75">
                  For salon teams
                </div>
                <h3 className="font-display text-2xl text-brand-graphite">Professional team training</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">
                  Train your team in scalp health assessments, treatment techniques, and product recommendations that add value and increase revenue.
                </p>
              </div>
              <div className="space-y-4">
                {partnershipServices.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-brand-graphite/8 bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-brand-graphite">{service.name}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/60">{service.duration}</p>
                      </div>
                      <span className="rounded-full bg-brand-graphite/12 px-3 py-1 text-xs font-medium text-brand-graphite">
                        Team training
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-brand-graphite/75">{service.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.focus.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-brand-salmon/60 px-3 py-1 text-xs uppercase tracking-[0.28em] text-brand-ivory"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <ButtonLink href={service.cta.href} variant="ghost" size="sm" className="mt-4 w-fit">
                      {service.cta.label}
                    </ButtonLink>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-brand-graphite/75">
                {partnershipEnhancements.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-graphite/35" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <ButtonLink href="/education#intensives" variant="secondary" size="md" className="w-fit">
                Plan your team training
              </ButtonLink>
            </Surface>
          </div>
        </Container>
      </PageSection>

      <ServicesShowcase />

      <PageSection tone="mist" texture="veined">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="How it works"
            title="A clear process from start to finish"
            description="Every service follows a proven approach that combines professional expertise with personalized attention."
            align="center"
          />
          <div className="grid gap-8 lg:grid-cols-4">
            {processSteps.map((step) => (
              <Surface key={step.title} variant="card" padding="lg" className="space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-graphite/55">Step {step.step}</span>
                <h3 className="font-display text-xl text-brand-graphite">{step.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{step.description}</p>
                <ul className="space-y-2 text-xs leading-relaxed text-brand-graphite/70">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon/40" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Ongoing support"
            title="Get continuous guidance and results"
            description="Retainer packages provide priority access, regular check-ins, and ongoing support for long-term success."
            align="center"
          />
          <Surface
            variant="glass"
            padding="lg"
            className="mx-auto flex flex-col gap-6 rounded-glass-lg border border-white/40 bg-white/75 backdrop-blur-sm lg:w-3/4"
          >
            <div className="space-y-3 text-brand-graphite/80">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-graphite/60">What you get</p>
              <ul className="space-y-2 text-base leading-relaxed">
                {conciergeAssurances.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/contact?service=retainer" variant="secondary" size="md">
                Inquire about retainers
              </ButtonLink>
              <ButtonLink href="/education#video-library" variant="ghost" size="md">
                View all courses
              </ButtonLink>
            </div>
          </Surface>
        </Container>
      </PageSection>

      <TestimonialsSection />
      <ConsultationCta />
    </main>
  );
}
