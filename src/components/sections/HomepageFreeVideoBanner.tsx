import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";

type HomepageFeaturedLead =
  | {
      kind: "VIDEO";
      slug: string;
      title: string;
      subtitle?: string | null;
      description?: string | null;
      category?: string | null;
      durationLabel?: string | null;
      heroUrl?: string | null;
    }
  | {
      kind: "QUIZ";
      slug: string;
      title: string;
      description?: string | null;
      category?: string | null;
      heroUrl?: string | null;
    };

export function HomepageFreeVideoBanner({
  lead: initialLead,
  video,
}: {
  lead?: HomepageFeaturedLead;
  video?: Extract<HomepageFeaturedLead, { kind: "VIDEO" }> | Omit<Extract<HomepageFeaturedLead, { kind: "VIDEO" }>, "kind">;
}) {
  const lead: HomepageFeaturedLead =
    initialLead ??
    ({
      kind: "VIDEO",
      ...(video as Omit<Extract<HomepageFeaturedLead, { kind: "VIDEO" }>, "kind">),
    } as Extract<HomepageFeaturedLead, { kind: "VIDEO" }>);

  const eyebrow = lead.kind === "QUIZ" ? "Featured quiz" : "Free video";
  const headline =
    lead.kind === "QUIZ"
      ? "Take the featured quiz and get Lorraine's next steps."
      : "Join the academy. Watch the free lesson. Upgrade when you are ready.";
  const description =
    lead.kind === "QUIZ"
      ? `Start ${lead.title}, add your email to unlock your guidance summary, and get a clear route into Lorraine's consultation support if you need it.`
      : `Create your free academy account to unlock ${lead.title} and step straight into Lorraine's clinical training world.`;
  const primaryHref =
    lead.kind === "QUIZ"
      ? `/quiz/${lead.slug}`
      : "/academy/signup";
  const secondaryHref =
    lead.kind === "QUIZ" ? `/quiz/${lead.slug}` : `/education/videos/${lead.slug}`;
  const secondaryLabel = lead.kind === "QUIZ" ? "See how it works" : "View free lesson";
  const mediaSrc = lead.heroUrl ?? photography.consultation.src;
  const mediaAlt = lead.heroUrl ? lead.title : photography.consultation.alt;

  return (
    <section className="relative overflow-hidden border-y border-brand-graphite/8 bg-brand-graphite py-12 text-white sm:py-16">
      <Container>
        <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-brand-salmon px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-white">
                {eyebrow}
              </span>
              <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
                {headline}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-white/78">
                <strong>{description}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/58">
              {lead.category ? <span>{lead.category}</span> : null}
              {lead.kind === "VIDEO" && lead.category && lead.durationLabel ? <span>/</span> : null}
              {lead.kind === "VIDEO" && lead.durationLabel ? <span>{lead.durationLabel}</span> : null}
              {(lead.category || (lead.kind === "VIDEO" && lead.durationLabel)) ? <span>/</span> : null}
              <span>{lead.kind === "QUIZ" ? "Email unlocks your guidance summary" : "Instant access after signup"}</span>
            </div>

            <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <h3 className="font-display text-2xl text-white">{lead.title}</h3>
              {lead.kind === "VIDEO" && lead.subtitle ? (
                <p className="mt-2 text-sm font-medium text-white/88">{lead.subtitle}</p>
              ) : null}
              {lead.description ? (
                <p className="mt-3 text-sm leading-relaxed text-white/72">{lead.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href={primaryHref} variant="primary" size="lg">
                {lead.kind === "QUIZ" ? "Start quiz" : "Create free academy account"}
              </ButtonLink>
              <ButtonLink href={secondaryHref} variant="ghost" size="lg" className="border-white/30 text-white hover:bg-white/10">
                {secondaryLabel}
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-brand-sand/20">
            <Image
              src={lead.heroUrl ?? photography.consultation.src}
              alt={mediaAlt}
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite/65 via-brand-graphite/20 to-brand-graphite/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <svg className="h-6 w-6 text-brand-salmon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/90">
                  {lead.kind === "QUIZ" ? "Featured quiz funnel" : "Free academy lesson"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
