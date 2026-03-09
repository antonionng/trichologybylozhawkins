export const dynamic = "force-dynamic";

import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizTaker } from "@/components/education/QuizTaker";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";
import { FEATURED_PUBLIC_QUIZ_RESULT_LABEL } from "@/lib/publicQuiz";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { Surface } from "@/components/layout/Surface";
import { getConsumerQuizIntro } from "@/lib/consumerQuizPresentation";
import { illustrationAssets, photography, textureAssets } from "@/lib/visualAssets";

interface Props {
  params: { slug: string };
}

async function getPublicQuiz(slug: string) {
  return prisma.quiz.findUnique({
    where: { slug },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          position: true,
          questionText: true,
          questionType: true,
          options: true,
          points: true,
          // Don't include correctAnswer - that stays server-side
        },
      },
    },
  });
}

export default async function PublicQuizPage({ params }: Props) {
  let quiz = await getPublicQuiz(params.slug);

  // If the DB is fresh and seeding hasn't been run, bootstrap the featured public quiz on-demand.
  if (!quiz) {
    const attempted = await ensureFeaturedPublicQuizExists(params.slug);
    if (attempted) {
      quiz = await getPublicQuiz(params.slug);
    }
  }

  if (!quiz || !quiz.isPublic || quiz.status !== "PUBLISHED") {
    notFound();
  }

  const intro = getConsumerQuizIntro(quiz.questions.length);

  return (
    <main className="min-h-screen">
      <PageSection
        tone="sand"
        texture="linen"
        padding="compact"
        collage={{
          parallax: true,
          layers: [
            { type: "texture", src: textureAssets.linen, blendMode: "multiply", opacity: 0.42 },
            { type: "illustration", src: illustrationAssets.fernSilhouette, blendMode: "screen", opacity: 0.24 },
            { type: "illustration", src: illustrationAssets.strandOrbit, blendMode: "soft-light", opacity: 0.32 },
          ],
        }}
        className="min-h-screen"
      >
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-brand-graphite/55">
                {intro.eyebrow}
              </span>
              <div className="space-y-3">
                <h1 className="max-w-xl font-display text-3xl leading-[1.05] text-brand-graphite sm:text-[3.2rem]">
                  {intro.title}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-brand-graphite/65">
                  {intro.body}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {intro.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-full border border-brand-graphite/10 bg-white/80 px-4 py-2 text-xs font-medium text-brand-graphite/70"
                >
                  {benefit}
                </span>
              ))}
            </div>

            <Surface variant="glass" padding="md" className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-graphite/40">
                What to expect
              </p>
              <p className="text-sm leading-relaxed text-brand-graphite/70">{intro.reassurance}</p>
            </Surface>

            <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/70 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
              <Image
                src={photography.consultation.src}
                alt={photography.consultation.alt}
                width={900}
                height={1100}
                priority
                className="h-[280px] w-full object-cover sm:h-[340px]"
              />
            </div>
          </div>

          <QuizTaker
            quiz={quiz as any}
            submitUrl={`/api/public/quiz/${encodeURIComponent(params.slug)}/submit`}
            mode="public_consumer"
            resultPrimaryCta={{ href: "/contact?service=clinic", label: FEATURED_PUBLIC_QUIZ_RESULT_LABEL }}
            resultSecondaryCta={{ href: "/education", label: "Explore academy" }}
          />
        </Container>
      </PageSection>
    </main>
  );
}

