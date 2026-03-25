export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { Container } from "@/components/layout/Container";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ArticleCta } from "@/components/sections/ArticleCta";
import { ButtonLink } from "@/components/ui/Button";
import { getTopicAccent } from "@/lib/topicAccents";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

interface Props {
  params: { slug: string };
}

async function getCondition(slug: string) {
  try {
    return await prisma.conditionReference.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        courses: {
          include: { course: { select: { id: true, title: true, slug: true } } },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const condition = await getCondition(params.slug);

  if (!condition) {
    return buildPageMetadata({
      path: `/education/conditions/${params.slug}`,
      title: "Condition guide not found",
      description: "The requested condition guide could not be found.",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    path: `/education/conditions/${params.slug}`,
    title: condition.name,
    description:
      condition.description ||
      (condition.whatIsIt as string | null) ||
      "Hair and scalp condition guide from Lorraine Hawkins.",
  });
}

export default async function ConditionDetailPage({ params }: Props) {
  const condition = await getCondition(params.slug);
  if (!condition) notFound();

  const accent = getTopicAccent(condition.category);
  const symptoms = Array.isArray(condition.symptoms) ? (condition.symptoms as string[]) : [];
  const causes = Array.isArray(condition.causes) ? (condition.causes as string[]) : [];
  const treatments = Array.isArray(condition.treatments) ? (condition.treatments as string[]) : [];
  const keyFacts = Array.isArray(condition.keyFacts) ? (condition.keyFacts as string[]) : [];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(`/education/conditions/${params.slug}`, [
          { name: "Home", path: "/" },
          { name: "Education", path: "/education" },
          { name: "Conditions", path: "/education/conditions" },
          { name: condition.name, path: `/education/conditions/${params.slug}` },
        ])}
      />
      <main className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <Container>
          <div className="mb-5 flex items-center gap-2 text-xs text-brand-graphite/40">
            <Link href="/education/conditions" className="hover:text-brand-graphite transition-colors">Conditions</Link>
            <span>/</span>
            <span className="text-brand-graphite/60 truncate">{condition.name}</span>
          </div>
          <div className="space-y-3">
            {condition.category && (
              <span className={`inline-flex rounded-full ${accent.bg} px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${accent.text}`}>
                {condition.category}
              </span>
            )}
            <h1 className="font-display text-3xl text-brand-graphite sm:text-[2.25rem]">{condition.name}</h1>
            {condition.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-brand-graphite/60">{condition.description}</p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Left column */}
            <div className="space-y-5">
              {condition.whatIsIt && (
                <div className="rounded-2xl border border-brand-graphite/8 bg-white p-5 shadow-sm space-y-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/40">What is it?</h2>
                  <p className="text-sm leading-relaxed text-brand-graphite/65 whitespace-pre-wrap">{condition.whatIsIt}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {symptoms.length > 0 && (
                  <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5 space-y-2`}>
                    <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent.text}`}>Signs &amp; Symptoms</h2>
                    <ul className="space-y-1.5">
                      {symptoms.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-brand-graphite/65">
                          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {causes.length > 0 && (
                  <div className="rounded-2xl border border-brand-graphite/8 bg-white p-5 space-y-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/40">Causes &amp; Risk Factors</h2>
                    <ul className="space-y-1.5">
                      {causes.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-brand-graphite/65">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/60" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {treatments.length > 0 && (
                <div className="rounded-2xl border border-brand-graphite/8 bg-white p-5 space-y-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/40">Treatment Options</h2>
                  <ul className="space-y-1.5">
                    {treatments.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-brand-graphite/65">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {keyFacts.length > 0 && (
                <div className={`rounded-2xl border ${accent.border} bg-gradient-to-br ${accent.gradient} p-5 space-y-3`}>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/50">Prognosis &amp; Outlook</h3>
                  <ul className="space-y-2">
                    {keyFacts.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm text-brand-graphite/65">
                        <span className={`${accent.text} text-xs mt-0.5`}>&#10038;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {condition.courses.length > 0 && (
                <div className="rounded-2xl border border-brand-graphite/8 bg-white p-5 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-graphite/40">Related Courses</h3>
                  <div className="space-y-2">
                    {condition.courses.map(({ course }) => (
                      <Link key={course.id} href={`/education/${course.slug}`} className="group block rounded-xl border border-brand-graphite/6 bg-brand-sand/15 p-3 transition-all hover:border-brand-salmon/20 hover:bg-brand-salmon/5">
                        <p className="text-sm font-semibold text-brand-graphite group-hover:text-brand-salmon transition-colors">{course.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-brand-graphite/8 bg-brand-sand/25 p-5 space-y-2">
                <h3 className="text-xs font-bold text-brand-graphite">Professional Help</h3>
                <p className="text-xs leading-relaxed text-brand-graphite/50">Experiencing symptoms? Consult a qualified trichologist for proper diagnosis and treatment.</p>
                <ButtonLink href="/contact" variant="secondary" size="sm">Book consultation</ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <ArticleCta category={condition.category || "Scalp Health"} />
      <ConsultationCta />
      </main>
    </>
  );
}
