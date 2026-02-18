import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { inPersonIntensives, type IntensiveProgramme } from "@/lib/content";
import { prisma } from "@/server/db/client";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

type WorkshopCard = {
  slug: string;
  title: string;
  headline: string | null;
  summary: string | null;
  duration: string | null;
  investment: string | null;
  location: string | null;
  heroUrl: string | null;
};

async function getWorkshops(): Promise<WorkshopCard[]> {
  try {
    const dbWorkshops = await prisma.workshop.findMany({
      where: { status: "PUBLISHED" },
      include: { heroMedia: true },
      orderBy: { createdAt: "asc" },
    });

    if (dbWorkshops.length > 0) {
      return Promise.all(
        dbWorkshops.map(async (w) => ({
          slug: w.slug,
          title: w.title,
          headline: w.headline,
          summary: w.summary,
          duration: w.duration,
          investment: w.investment,
          location: w.location,
          heroUrl: w.heroMedia?.path
            ? await createSignedDownloadUrl(w.heroMedia.path)
            : null,
        }))
      );
    }
  } catch {
    // DB not available — fall through to static
  }

  return inPersonIntensives.map((w) => ({
    slug: w.slug,
    title: w.title,
    headline: w.headline,
    summary: w.summary,
    duration: w.duration,
    investment: w.investment,
    location: w.location,
    heroUrl: null,
  }));
}

export default async function WorkshopsListingPage() {
  const workshops = await getWorkshops();

  return (
    <main>
      <PageSection tone="sand" texture="linen" collage={{ parallax: true }}>
        <Container className="text-center space-y-4">
          <SectionHeading
            eyebrow="In-Person Training"
            title="Hands-on workshops led by Lorraine"
            description="Structured in-person training for trichologists, stylists, and salon teams. Practical skills you can use from day one."
            align="center"
          />
        </Container>
      </PageSection>

      <PageSection padding="default">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <Link
                key={workshop.slug}
                href={`/education/workshops/${workshop.slug}`}
                className="group block h-full"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-sage/15 bg-white shadow-sm transition-all hover:shadow-lg hover:border-brand-sage/30">
                  <div className="relative h-44 overflow-hidden">
                    {workshop.heroUrl ? (
                      <>
                        <Image
                          src={workshop.heroUrl}
                          alt={workshop.title}
                          width={600}
                          height={300}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-sage/10 via-brand-sage/5 to-brand-sand/20">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110">
                          <svg
                            className="h-5 w-5 text-brand-sage"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-brand-sage/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-graphite/60 backdrop-blur-sm">
                      In-Person
                    </span>
                    {workshop.investment && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold text-brand-graphite shadow-sm">
                        {workshop.investment}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-display text-lg leading-snug text-brand-graphite group-hover:text-brand-sage transition-colors">
                      {workshop.title}
                    </h3>
                    {workshop.headline && (
                      <p className="text-xs text-brand-graphite/50 line-clamp-1">
                        {workshop.headline}
                      </p>
                    )}
                    <p className="flex-1 text-sm leading-relaxed text-brand-graphite/60 line-clamp-2">
                      {workshop.summary}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-brand-graphite/40">
                      {workshop.duration && <span>{workshop.duration}</span>}
                      {workshop.location && (
                        <>
                          <span>&middot;</span>
                          <span>{workshop.location}</span>
                        </>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-sage">
                      View details <span aria-hidden>&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* Bottom CTA */}
      <PageSection
        tone="graphite"
        padding="compact"
      >
        <Container className="text-center space-y-4">
          <h2 className="font-display text-xl text-white sm:text-2xl">
            Not sure which training is right for you?
          </h2>
          <p className="mx-auto max-w-md text-sm text-white/60">
            Contact Lorraine to discuss your goals and she&apos;ll recommend the
            best programme for you or your team.
          </p>
          <ButtonLink
            href="/contact"
            variant="ghost"
            size="lg"
            className="border-white/20 text-white hover:border-white/40 hover:bg-white/10"
          >
            Get in touch
          </ButtonLink>
        </Container>
      </PageSection>
    </main>
  );
}
