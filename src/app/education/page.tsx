import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { FaqSection } from "@/components/sections/FaqSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";
import { inPersonIntensives, videoLessons } from "@/lib/content";
import { photography } from "@/lib/visualAssets";

const educationMetrics = [
  { value: "3", label: "video courses available" },
  { value: "£35", label: "per course" },
  { value: "18+", label: "years teaching experience" },
];

const deliveryHighlights = [
  "High-quality videos with transcripts, worksheets, and templates",
  "Instant access after purchase, watch anytime",
  "Downloadable resources and templates included",
];

const supportTracks = [
  {
    title: "Practice Resources",
    description:
      "Get ready-to-use templates, client consultation guides, and nutrition recommendations with every course.",
    bullets: [
      "Consultation templates you can customize",
      "Product recommendation scripts",
      "Client home care guidance",
    ],
  },
  {
    title: "Business Support",
    description:
      "Build a profitable scalp health service with guidance on pricing, marketing, and team training.",
    bullets: [
      "Pricing and service package templates",
      "Team training guides",
      "Ongoing support and check-ins",
    ],
  },
];

const purchaseAssurances = [
  "Secure checkout with instant access to your course",
  "Personal support if you need help choosing courses or booking training",
  "Team packages available for salons and businesses",
];

export default function Education() {
  return (
    <main>
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)] lg:items-center">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Education"
              title="Learn online with video courses"
              description="Start learning today with professional video courses you can watch anytime, anywhere."
            />
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="#video-library" variant="secondary" size="lg">
                View video courses
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {educationMetrics.map((metric) => (
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
          <div className="space-y-4">
            <Surface variant="glass" padding="none" className="overflow-hidden rounded-glass-lg max-w-md aspect-square">
              <Image
                src={photography.education.src}
                alt={photography.education.alt}
                width={400}
                height={400}
                className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                priority
              />
            </Surface>
            <Surface variant="card" padding="md" className="space-y-3 text-brand-graphite/80 max-w-md">
              <h3 className="font-display text-lg text-brand-graphite">How you'll learn</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                {deliveryHighlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-brand-salmon"
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

      <PageSection tone="transparent" id="video-library">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Video courses"
            title="Start learning immediately"
            description="Each £35 course includes video lessons, transcripts, worksheets, and checklists. Download and start using what you learn right away."
            align="center"
          />
          <div className="grid gap-8 lg:grid-cols-3">
            {videoLessons.map((lesson) => (
              <Surface key={lesson.id} variant="card" padding="lg" className="flex h-full flex-col gap-5">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full bg-brand-salmon/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-brand-ivory">
                    {lesson.category}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl leading-snug text-brand-graphite">{lesson.title}</h3>
                    <p className="text-xs uppercase tracking-[0.32em] text-brand-graphite/55">
                      {lesson.duration} · {lesson.investment}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-graphite/75">{lesson.summary}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-brand-graphite/70">
                    {lesson.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-brand-graphite/40" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ButtonLink
                  href={`/education?purchase=${lesson.slug}`}
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                >
                  Download for £35
                </ButtonLink>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="mist" texture="veined" id="intensives">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="In-person workshops"
            title="Hands-on training in London or at your location"
            description="Every workshop includes practical demonstrations, guided practice, and business guidance customized for your team."
            align="center"
          />
          <div className="grid gap-10 lg:grid-cols-3">
            {inPersonIntensives.map((programme) => (
              <Surface key={programme.id} variant="card" padding="lg" className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl text-brand-graphite">{programme.title}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/55">
                      {programme.duration} · {programme.investment}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-graphite/75">{programme.summary}</p>
                  </div>
                  <div className="space-y-1 text-xs uppercase tracking-[0.28em] text-brand-graphite/60">
                    <span>{programme.location}</span>
                  </div>
                  <ul className="space-y-2 text-sm leading-relaxed text-brand-graphite/75">
                    {programme.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2">
                        <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-brand-salmon/40" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ButtonLink href={`/contact?intensive=${programme.slug}`} variant="secondary" size="md" className="w-fit">
                  Reserve dates
                </ButtonLink>
              </Surface>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection tone="transparent">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Support"
            title="Everything you need to succeed"
            description="Get templates, guidance, and ongoing support to help you implement what you learn and grow your business."
            align="center"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            {supportTracks.map((track) => (
              <Surface key={track.title} variant="card" padding="lg" className="space-y-4">
                <h3 className="font-display text-2xl text-brand-graphite">{track.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/75">{track.description}</p>
                <ul className="space-y-2 text-sm leading-relaxed text-brand-graphite/75">
                  {track.bullets.map((bullet) => (
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

      <PageSection tone="sand" texture="linen">
        <Container>
          <Surface
            variant="glass"
            padding="lg"
            className="grid gap-8 rounded-glass-lg border border-white/40 bg-white/80 backdrop-blur-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:items-center"
          >
            <div className="space-y-4">
              <h3 className="font-display text-3xl leading-tight text-brand-graphite">
                Need help choosing the right training?
              </h3>
              <p className="text-base leading-relaxed text-brand-graphite/75">
                Tell us about your goals and we'll create a custom training plan combining video courses, workshops, and ongoing support for your salon or clinic.
              </p>
              <div className="flex flex-wrap gap-4">
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Get personalized guidance
                </ButtonLink>
                <ButtonLink href="/services" variant="ghost" size="lg">
                  View all services
                </ButtonLink>
              </div>
            </div>
            <Surface variant="subtle" padding="lg" className="space-y-3 text-sm leading-relaxed text-brand-graphite/80">
              <p className="font-semibold text-brand-graphite">What to expect</p>
              <ul className="space-y-2">
                {purchaseAssurances.map((assurance) => (
                  <li key={assurance} className="flex gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon" />
                    <span>{assurance}</span>
                  </li>
                ))}
              </ul>
            </Surface>
          </Surface>
        </Container>
      </PageSection>

      <FaqSection />
      <TestimonialsSection />
      <ConsultationCta />
    </main>
  );
}
