import Image from "next/image";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";

const aboutMetrics = [
  { value: "2,400+", label: "scalp analyses completed" },
  { value: "38", label: "global salon partners" },
  { value: "12", label: "published education modules" },
];

const careerMilestones = [
  {
    year: "2007",
    title: "Starting out",
    description:
      "Qualified from the Institute of Trichologists and began working with dermatologists in London clinics, focusing on complex scalp conditions.",
  },
  {
    year: "2013",
    title: "Teaching salons",
    description:
      "Started training salon teams on scalp health assessments and treatments, helping them add valuable services their clients appreciate.",
  },
  {
    year: "2018",
    title: "Developing courses",
    description:
      "Created comprehensive training programs combining hands-on workshops, video lessons, and ongoing support for practitioners.",
  },
  {
    year: "2024",
    title: "Expanding globally",
    description:
      "Now advising brands and wellness businesses while running a private clinic and teaching professionals worldwide.",
  },
];

const philosophyPillars = [
  {
    title: "Science-based approach",
    description:
      "Every treatment and recommendation is backed by research and proven methods. What works in the real world matters most.",
  },
  {
    title: "Compassionate care",
    description:
      "Scalp and hair concerns are personal. Clients and students receive supportive, judgment-free guidance they can actually use.",
  },
  {
    title: "Practical education",
    description:
      "Training focuses on skills you can apply immediately. Learn techniques that help your clients and grow your business.",
  },
];

const mediaFeatures = [
  {
    outlet: "The Trichology Journal",
    highlight: "Featured for innovative training methods that combine technology with hands-on learning.",
  },
  {
    outlet: "Salon Business Weekly",
    highlight: "Recognized as a leading educator helping salons add profitable scalp health services.",
  },
  {
    outlet: "Wellness Futures Summit",
    highlight: "Keynote speaker on effective scalp treatments and professional consultation techniques.",
  },
];

const advisoryCollective = [
  {
    name: "Elaine Brooks, Cosmetic Scientist",
    focus: "Advises on ingredient selection and product formulations that work for all hair types and textures.",
  },
  {
    name: "Dr. Samir Patel, Dermatologist",
    focus: "Medical referral partner for cases requiring specialist dermatological treatment and care.",
  },
  {
    name: "Aisha Morgan, Salon Business Consultant",
    focus: "Helps salons implement new scalp services, from pricing to marketing and staff training.",
  },
];

export default function About() {
  return (
    <main>
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="About"
              title="Lorraine Hawkins"
              description="Trichologist and educator helping people understand and improve their scalp health with science-backed methods."
            />
            <div className="space-y-4 text-base leading-relaxed text-brand-graphite/78">
              <p>
                For nearly two decades, Lorraine has specialized in understanding scalp health. She helps individuals restore their hair and scalp while training salon professionals to do the same.
              </p>
              <p>
                Today she runs a private clinic, teaches courses globally, and advises brands on effective, evidence-based scalp care.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/education" variant="secondary" size="lg">
                View courses
              </ButtonLink>
              <ButtonLink href="/services" variant="ghost" size="lg">
                Book consultation
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {aboutMetrics.map((metric) => (
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
                src={photography.hero.src}
                alt={photography.hero.alt}
                width={600}
                height={780}
                className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                priority
              />
            </Surface>
            <Surface variant="card" padding="lg" className="space-y-3 text-sm leading-relaxed text-brand-graphite/78">
              <p className="font-semibold text-brand-graphite">Credentials snapshot</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon" />
                  <span>Fellow, Institute of Trichologists (FIT)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon" />
                  <span>Certified Nutritional Practitioner & stress management facilitator</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon" />
                  <span>Former Head of Education at Shoreline Wellness Collective</span>
                </li>
              </ul>
            </Surface>
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Journey"
            title="How this practice evolved"
            description="Nearly two decades of learning, growing, and refining an approach that truly helps people."
            align="center"
          />
          <div className="relative mx-auto max-w-4xl space-y-6 border-l border-brand-graphite/12 pl-8">
            {careerMilestones.map((milestone) => (
              <div key={milestone.year} className="relative space-y-2 pl-6">
                <span
                  className="absolute -left-[15px] top-1 inline-flex h-3 w-3 rounded-full bg-brand-salmon"
                  aria-hidden
                />
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/55">{milestone.year}</p>
                <h3 className="font-display text-xl text-brand-graphite">{milestone.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{milestone.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="mist" texture="veined">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Approach"
            title="How Lorraine works"
            description="Effective scalp care combines scientific knowledge with genuine understanding of what clients need."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {philosophyPillars.map((pillar) => (
              <Surface key={pillar.title} variant="card" padding="md" className="space-y-3">
                <h3 className="font-display text-xl text-brand-graphite">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{pillar.description}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Recognition"
            title="Featured insights and speaking"
            description="Lorraine shares expertise through industry events, publications, and professional forums."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {mediaFeatures.map((feature) => (
              <Surface key={feature.outlet} variant="card" padding="md" className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/55">{feature.outlet}</p>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{feature.highlight}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="sand" texture="linen">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Network"
            title="Expert collaborators"
            description="Lorraine works with trusted specialists to provide comprehensive care when clients need additional support."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {advisoryCollective.map((advisor) => (
              <Surface
                key={advisor.name}
                variant="card"
                padding="md"
                className="space-y-3 text-sm leading-relaxed text-brand-graphite/78"
              >
                <p className="font-display text-xl text-brand-graphite">{advisor.name}</p>
                <p>{advisor.focus}</p>
              </Surface>
            ))}
          </div>
          <Surface
            variant="glass"
            padding="lg"
            className="mx-auto flex flex-col gap-4 rounded-glass-lg border border-white/40 bg-white/80 backdrop-blur-sm text-base leading-relaxed text-brand-graphite/78 lg:w-3/4"
          >
            <p>
              This network ensures clients get comprehensive support, whether they need specialist medical care, nutrition guidance, or business development help.
            </p>
            <ButtonLink href="/contact" variant="secondary" size="md" className="w-fit">
              Get in touch
            </ButtonLink>
          </Surface>
        </Container>
      </PageSection>

      <TestimonialsSection />
      <ConsultationCta />
    </main>
  );
}
