import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { photography } from "@/lib/visualAssets";

type FreeAcademyLeadPromo =
  | {
      kind: "VIDEO";
      id: string;
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
      id: string;
      slug: string;
      title: string;
      description?: string | null;
      category?: string | null;
      heroUrl?: string | null;
    };

export function FreeAcademyVideoPromoSection({
  lead: initialLead,
  video,
}: {
  lead?: FreeAcademyLeadPromo;
  video?: Extract<FreeAcademyLeadPromo, { kind: "VIDEO" }> | Omit<Extract<FreeAcademyLeadPromo, { kind: "VIDEO" }>, "kind">;
}) {
  const lead: FreeAcademyLeadPromo =
    initialLead ??
    ({
      kind: "VIDEO",
      ...(video as Omit<Extract<FreeAcademyLeadPromo, { kind: "VIDEO" }>, "kind">),
    } as Extract<FreeAcademyLeadPromo, { kind: "VIDEO" }>);

  const primaryHref =
    lead.kind === "QUIZ"
      ? `/academy/signup?next=${encodeURIComponent(`/quiz/${lead.slug}?unlock=1`)}`
      : "/academy/signup";
  const secondaryHref =
    lead.kind === "QUIZ" ? `/quiz/${lead.slug}` : `/education/videos/${lead.slug}`;
  const secondaryLabel = lead.kind === "QUIZ" ? "Take featured quiz" : "View lesson details";
  const mediaAlt = lead.heroUrl ? lead.title : photography.consultation.alt;

  return (
    <section className="border-y border-brand-graphite/6 bg-gradient-to-br from-brand-salmon/8 via-brand-sand/20 to-white py-10 sm:py-12">
      <Container>
        <div className="grid gap-6 overflow-hidden rounded-3xl border border-brand-graphite/8 bg-white shadow-sm lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="space-y-5 p-6 sm:p-8">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-brand-salmon/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-brand-salmon">
                {lead.kind === "QUIZ" ? "Featured quiz" : "Free with signup"}
              </span>
              <h2 className="font-display text-2xl text-brand-graphite sm:text-3xl">
                {lead.kind === "QUIZ" ? "Unlock full quiz results with signup" : "Start with a free academy lesson"}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-graphite/60">
                {lead.kind === "QUIZ"
                  ? <>Take <strong>{lead.title}</strong>, then create your free academy account to unlock full quiz results, tailored next steps, and Lorraine&apos;s academy recommendations.</>
                  : <>Create your free academy account to unlock <strong>{lead.title}</strong>, then explore the rest of Lorraine&apos;s paid course library when you are ready.</>}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-brand-graphite/8 bg-brand-sand/20 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-brand-graphite/45">
                {lead.category ? <span>{lead.category}</span> : null}
                {lead.kind === "VIDEO" && lead.category && lead.durationLabel ? <span>/</span> : null}
                {lead.kind === "VIDEO" && lead.durationLabel ? <span>{lead.durationLabel}</span> : null}
              </div>
              <h3 className="font-display text-xl text-brand-graphite">{lead.title}</h3>
              {lead.kind === "VIDEO" && lead.subtitle ? (
                <p className="text-sm font-medium text-brand-graphite/75">{lead.subtitle}</p>
              ) : null}
              {lead.description ? (
                <p className="text-sm leading-relaxed text-brand-graphite/60">{lead.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href={primaryHref} variant="primary" size="md">
                {lead.kind === "QUIZ" ? "Unlock full quiz results" : "Create free academy account"}
              </ButtonLink>
              <ButtonLink href={secondaryHref} variant="ghost" size="md">
                {secondaryLabel}
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[220px] bg-brand-sand/25">
            <Image
              src={lead.heroUrl ?? photography.consultation.src}
              alt={mediaAlt}
              fill
              sizes="320px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite/45 via-brand-graphite/10 to-brand-graphite/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <svg className="h-5 w-5 text-brand-salmon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                  {lead.kind === "QUIZ" ? "Featured academy quiz" : "Free academy video"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
