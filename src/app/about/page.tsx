import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/about",
  title: "About Lorraine Hawkins",
  description:
    "Learn about Lorraine Hawkins, her clinical trichology background, education work, and evidence-led approach to scalp health and hair loss support.",
  keywords: [
    "about lorraine hawkins",
    "clinical trichologist",
    "trichology educator",
    "scalp health expert",
  ],
});

const aboutMetrics = [
  { value: "25+", label: "Years practice" },
  { value: "2,400+", label: "Consultations" },
  { value: "Video & live", label: "Formats" },
];

const careerMilestones = [
  { year: "2007", title: "Clinical foundations", description: "Qualified as a trichologist through Tricocare (tricocare.co.uk). Began working alongside dermatologists in London clinics, focusing on complex scalp conditions and diagnostics.", color: "bg-rose-400" },
  { year: "2013", title: "Training professionals", description: "Started teaching salon teams how to assess scalp health, deliver treatments, and have supportive conversations with clients.", color: "bg-amber-400" },
  { year: "2018", title: "Building education programs", description: "Created structured training programs, hands-on workshops, and online courses that made trichology education accessible to more practitioners.", color: "bg-emerald-400" },
  { year: "2025", title: "Video education", description: "Launched condition-specific video training modules for hair professionals. Evidence-based clinical education accessible to practitioners everywhere.", color: "bg-sky-400" },
];

const philosophyPillars = [
  { num: "01", title: "Evidence-based", description: "Every recommendation grounded in research and clinical experience. Lorraine won't tell you something works unless she's seen it work.", accent: "border-rose-200" },
  { num: "02", title: "Honest and clear", description: "No miracle cures and no jargon. Lorraine explains what is happening, what helps, and what does not in language anyone can understand.", accent: "border-amber-200" },
  { num: "03", title: "Practical", description: "Education you can use immediately. Whether managing your own concerns or building a trichology practice.", accent: "border-emerald-200" },
];

export default function About() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-salmon/[0.04]" />

        <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="space-y-5">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">About</span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">Lorraine Hawkins</h1>
              <p className="text-base leading-relaxed text-brand-graphite/70">
                Lorraine Hawkins has over 25 years of experience in the hair industry and is a qualified trichologist and educator. She shares her expertise through video courses, structured training programs, and hands-on workshops designed for professionals who want to deepen their understanding of hair and scalp health.
              </p>
              <div className="space-y-3 text-sm leading-relaxed text-brand-graphite/60">
                <p>Her approach: explain what&rsquo;s happening clearly, recommend what&rsquo;s supported by evidence, and be honest about what she doesn&rsquo;t know.</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <ButtonLink href="/education" variant="secondary" size="sm">Browse Training</ButtonLink>
                <ButtonLink href="/clinic" variant="ghost" size="sm">Knutsford clinic</ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {aboutMetrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-brand-graphite/8 bg-white p-3 text-center">
                    <p className="font-display text-lg text-brand-graphite">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-brand-graphite/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={photography.hero.src}
                  alt="Lorraine Hawkins, clinical trichologist and educator."
                  width={600} height={780}
                  className="h-full w-full object-cover saturate-[0.92] contrast-[1.05]"
                  priority
                />
              </div>
              <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-graphite/45">Credentials</p>
                <ul className="space-y-1.5 text-sm text-brand-graphite/65">
                  {["Qualified trichologist, Tricocare", "Certified Nutritional Practitioner"].map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-salmon" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Education mission ─────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">What Lorraine does</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">Education mission</h2>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-brand-sage/20 bg-white p-5 shadow-sm">
              <span className="inline-flex self-start rounded-full bg-brand-sage/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-graphite/55">Professional education</span>
              <h3 className="font-display text-lg text-brand-graphite">Training hair professionals</h3>
              <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60">Video courses, structured training programs, and hands-on workshops for trichologists, stylists, and salon teams. Clinical skills and consultation confidence built on 25 years of practice.</p>
              <ButtonLink href="/education" variant="ghost" size="sm">Training programs &rarr;</ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-mist/15 via-brand-sand/25 to-white py-10 sm:py-12">
        <Container>
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">Journey</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">How this practice evolved</h2>
          </div>
          <div className="relative mx-auto max-w-3xl">
            {/* Gradient connecting line */}
            <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-rose-200 via-amber-200 to-sky-200" aria-hidden />
            <div className="space-y-5">
              {careerMilestones.map((m) => (
                <div key={m.year} className="relative flex gap-5 pl-2">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
                    <span className={`h-3 w-3 rounded-full ${m.color} shadow-sm`} />
                  </div>
                  <div className="rounded-xl border border-brand-graphite/8 bg-white p-4 flex-1 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-graphite/40">{m.year}</p>
                    <h3 className="mt-0.5 font-display text-base text-brand-graphite">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-brand-graphite/60">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Philosophy pillars ────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-graphite/35">Approach</span>
            <h2 className="mt-1 font-display text-2xl text-brand-graphite">How Lorraine works</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {philosophyPillars.map((p) => (
              <div key={p.title} className={`flex flex-col gap-3 rounded-2xl border-t-4 ${p.accent} border border-brand-graphite/8 bg-white p-5 shadow-sm`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-graphite/5 text-xs font-bold text-brand-graphite/50">{p.num}</span>
                <h3 className="font-display text-lg text-brand-graphite">{p.title}</h3>
                <p className="text-sm leading-relaxed text-brand-graphite/60">{p.description}</p>
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
