export const dynamic = "force-dynamic";

import { prisma } from "@/server/db/client";
import { Container } from "@/components/layout/Container";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { getTopicAccent } from "@/lib/topicAccents";
import Link from "next/link";

async function getPublishedConditions() {
  try {
    return await prisma.conditionReference.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function ConditionLibraryPage() {
  const conditions = await getPublishedConditions();

  const grouped: Record<string, typeof conditions> = {};
  for (const condition of conditions) {
    const category = condition.category || "Other";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(condition);
  }
  const categories = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand/60 via-brand-linen/20 to-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-salmon/[0.04]" />
        <Container className="relative pb-8 pt-14 sm:pb-10 sm:pt-20">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-brand-salmon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-salmon">Reference Library</span>
              <h1 className="font-display text-3xl leading-[1.15] text-brand-graphite sm:text-[2.5rem]">Hair &amp; Scalp Conditions</h1>
              <p className="max-w-lg text-sm leading-relaxed text-brand-graphite/60">
                Quick-reference guides to common hair loss and scalp conditions, each following a clinical framework covering signs, symptoms, causes, prognosis and treatment options.
              </p>
            </div>
            <Link href="/education" className="hidden shrink-0 rounded-full border border-brand-graphite/8 bg-white px-3 py-1.5 text-xs font-semibold text-brand-graphite/60 transition-colors hover:text-brand-graphite sm:inline-flex">&larr; Education</Link>
          </div>
        </Container>
      </section>

      {/* ── Conditions grid ───────────────────────────────────────────── */}
      <section className="py-10 sm:py-12">
        <Container className="space-y-10">
          {categories.map((category) => {
            const accent = getTopicAccent(category);
            return (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                  <h2 className="font-display text-xl text-brand-graphite">{category}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[category].map((condition) => {
                    const cAccent = getTopicAccent(condition.category);
                    return (
                      <Link key={condition.id} href={`/education/conditions/${condition.slug}`} className="group block">
                        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white transition-all hover:shadow-md hover:border-brand-graphite/15">
                          <div className={`h-1 bg-gradient-to-r ${cAccent.gradient}`} />
                          <div className="flex flex-1 flex-col gap-3 p-5">
                            <h3 className="font-display text-base text-brand-graphite group-hover:text-brand-salmon transition-colors">{condition.name}</h3>
                            <p className="text-sm leading-relaxed text-brand-graphite/55 line-clamp-2">
                              {condition.description || (condition.whatIsIt ? condition.whatIsIt.substring(0, 140) + "..." : "Information coming soon.")}
                            </p>

                            {condition.symptoms && Array.isArray(condition.symptoms) && (condition.symptoms as string[]).length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-graphite/35">Signs</p>
                                <ul className="mt-1 space-y-1">
                                  {(condition.symptoms as string[]).slice(0, 2).map((s, i) => (
                                    <li key={i} className="flex gap-1.5 text-xs text-brand-graphite/45">
                                      <span className={`mt-1 h-1 w-1 shrink-0 rounded-full ${cAccent.dot} opacity-60`} />
                                      <span className="line-clamp-1">{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <span className="mt-auto text-[11px] font-semibold text-brand-salmon">Learn more &rarr;</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {conditions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-graphite/15 bg-white/50 px-8 py-16 text-center">
              <p className="text-sm text-brand-graphite/50">Condition reference library coming soon.</p>
              <p className="mt-1 text-xs text-brand-graphite/35">Check back later for detailed information.</p>
            </div>
          )}
        </Container>
      </section>

      <ConsultationCta />
    </main>
  );
}
