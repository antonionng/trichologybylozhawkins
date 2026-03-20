export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { QuizTaker } from "@/components/education/QuizTaker";
import { QuizPageShell } from "@/components/education/QuizPageShell";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";
import { getCurrentSession } from "@/server/security/auth";
import {
  FEATURED_PUBLIC_QUIZ_RESULT_LABEL,
  FEATURED_PUBLIC_QUIZ_SLUG,
  PROFESSIONAL_GATED_QUIZ_SLUG,
} from "@/lib/publicQuiz";
import { Surface } from "@/components/layout/Surface";
import { getConsumerQuizIntro } from "@/lib/consumerQuizPresentation";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

interface Props {
  params: { slug: string };
}

type PublicQuiz = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  heroMediaId: string | null;
  cardImageUrl: string | null;
  course: { id: string; title: string; slug: string };
  questions: Array<{
    id: string;
    position: number;
    questionText: string;
    questionType: string;
    options: unknown;
    points: number;
  }>;
};

async function getPublicQuiz(slug: string): Promise<PublicQuiz | null> {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, isPublic: true, status: "PUBLISHED" },
  });

  if (!quiz) {
    return null;
  }

  const [course, questions] = await Promise.all([
    prisma.course.findUnique({
      where: { id: quiz.courseId },
      select: { id: true, title: true, slug: true },
    }),
    prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      orderBy: { position: "asc" },
      select: {
        id: true,
        position: true,
        questionText: true,
        questionType: true,
        options: true,
        points: true,
      },
    }),
  ]);

  if (!course) {
    return null;
  }

  return {
    ...quiz,
    heroMediaId: (quiz as any).heroMediaId ?? null,
    cardImageUrl: (quiz as any).cardImageUrl ?? null,
    course,
    questions,
  };
}

async function resolvePublicQuizHeroUrl(quiz: PublicQuiz): Promise<string | null> {
  if (quiz.heroMediaId) {
    const heroMedia = await prisma.mediaAsset.findUnique({
      where: { id: quiz.heroMediaId },
      select: { path: true },
    });

    if (heroMedia?.path) {
      try {
        return await createSignedDownloadUrl(heroMedia.path);
      } catch {
        /* use card image fallback */
      }
    }
  }

  const external = quiz.cardImageUrl?.trim();
  return external || null;
}

export default async function PublicQuizPage({ params }: Props) {
  const session = await getCurrentSession();

  let quiz = await getPublicQuiz(params.slug);

  // If the DB is fresh and seeding hasn't been run, bootstrap the featured public quiz on-demand.
  if (!quiz) {
    const attempted = await ensureFeaturedPublicQuizExists(params.slug);
    if (attempted) {
      quiz = await getPublicQuiz(params.slug);
    }
  }

  if (!quiz) {
    notFound();
  }

  const quizHeroUrl = await resolvePublicQuizHeroUrl(quiz);
  const isConsumerScalpQuiz = params.slug === FEATURED_PUBLIC_QUIZ_SLUG;
  const isProfessionalGatedQuiz = params.slug === PROFESSIONAL_GATED_QUIZ_SLUG;
  const intro = isConsumerScalpQuiz ? getConsumerQuizIntro(quiz.questions.length) : null;
  const quizMode = isConsumerScalpQuiz
    ? "public_consumer"
    : isProfessionalGatedQuiz
      ? "public_signup_gate"
      : "academy";
  const resultsLabel = isProfessionalGatedQuiz && !session ? "Unlock" : "Instant";
  const title = intro?.title ?? quiz.title;
  const description =
    intro?.body ??
    quiz.description ??
    "Assess your professional trichology knowledge and see the next training steps that fit your score.";
  const highlights =
    intro?.benefits ?? [
      "Built for hair professionals and trichology learners",
      `${quiz.questions.length} knowledge-check questions`,
      "Training-focused next steps",
    ];
  const reassurance =
    intro?.reassurance ??
    "Work through each question in order. Your results will show where to focus next in Lorraine's professional education.";
  const guidanceLabel = isConsumerScalpQuiz ? "Lorraine" : "Academy";
  const resultPrimaryCta = isConsumerScalpQuiz
    ? {
        href: "/contact?service=clinic",
        label: FEATURED_PUBLIC_QUIZ_RESULT_LABEL,
      }
    : {
        href: "/education",
        label: "Explore professional training",
      };
  const resultSecondaryCta = isConsumerScalpQuiz
    ? { href: "/education", label: "Explore academy" }
    : { href: "/academy", label: "Back to academy" };

  return (
    <QuizPageShell
      variant="public"
      eyebrow={intro?.eyebrow ?? "Professional trichology quiz"}
      title={title}
      description={description}
      heroUrl={quizHeroUrl}
      heroAlt={quiz.title}
      highlights={highlights}
      stats={[
        { label: "Questions", value: quiz.questions.length },
        { label: "Results", value: resultsLabel },
        { label: "Guidance", value: guidanceLabel },
      ]}
      supportingPanel={
        <Surface variant="glass" padding="md" className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-graphite/40">
            What to expect
          </p>
          <p className="text-sm leading-relaxed text-brand-graphite/70">
            {reassurance}
          </p>
        </Surface>
      }
    >
      <QuizTaker
        quiz={quiz as any}
        submitUrl={`/api/public/quiz/${encodeURIComponent(params.slug)}/submit`}
        mode={quizMode}
        resultPrimaryCta={resultPrimaryCta}
        resultSecondaryCta={resultSecondaryCta}
      />
    </QuizPageShell>
  );
}

