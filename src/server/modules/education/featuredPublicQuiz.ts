import { CourseLevel, CourseStatus, EnrollmentType, QuestionType, QuizStatus } from "@prisma/client";
import { prisma } from "@/server/db/client";

export const FEATURED_PUBLIC_QUIZ_SLUG = "trichology-knowledge-check";

type SeedQuestion = {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
};

const FEATURED_PUBLIC_QUIZ = {
  slug: FEATURED_PUBLIC_QUIZ_SLUG,
  title: "Trichology Knowledge Check",
  description:
    "A quick assessment to benchmark your trichology knowledge and highlight the next best steps for your learning.",
  passingScore: 70,
  resultsCopy: {
    low: {
      headline: "You’ve got a solid starting point — let’s build foundations.",
      body:
        "Your results suggest you’re early in your trichology journey. The fastest path forward is nailing the hair growth cycle, core scalp conditions, and a structured consultation workflow.",
    },
    medium: {
      headline: "Strong core knowledge — you’re ready to sharpen clinical reasoning.",
      body:
        "You’ve got good fundamentals. The next upgrade is tightening differential diagnosis, triggers, and evidence-based care planning to improve outcomes and confidence.",
    },
    high: {
      headline: "Excellent — you’re thinking like a clinician.",
      body:
        "Your score suggests strong understanding of trichology fundamentals. The next level is consistency: documentation, referral thresholds, and refining protocols for complex cases.",
    },
  } as const,
  questions: [
    {
      questionText: "Which phase of the hair cycle involves active growth?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Telogen", "Catagen", "Anagen", "Exogen"],
      correctAnswer: 2,
      explanation:
        "Anagen is the active growth phase; catagen is transition; telogen is resting; exogen is shedding.",
    },
    {
      questionText:
        "A widened midline part with preserved frontal hairline in a woman most strongly suggests:",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Alopecia areata", "Female pattern hair loss", "Trichotillomania", "Tinea capitis"],
      correctAnswer: 1,
    },
    {
      questionText: "Which is a common trigger window for telogen effluvium after a stressor?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["1–7 days", "2–3 months", "9–12 months", "Immediately during the event"],
      correctAnswer: 1,
    },
    {
      questionText: "A scalp that is greasy with adherent scale and itch is most consistent with:",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Seborrhoeic dermatitis", "Vitiligo", "Androgenetic alopecia", "Lichen planopilaris"],
      correctAnswer: 0,
    },
    {
      questionText: "Traction alopecia is always irreversible.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: 1,
      explanation:
        "Early traction alopecia can be reversible; chronic traction may lead to permanent scarring.",
    },
    {
      questionText: "Which pattern is most typical of alopecia areata?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Diffuse thinning", "Patchy, well-demarcated hair loss", "Frontal band recession only", "Vertex-only thinning"],
      correctAnswer: 1,
    },
    {
      questionText: "When a client reports shedding, the MOST useful first step is to:",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Prescribe supplements immediately", "Take a structured history and timeline", "Advise daily washing only", "Recommend scalp microneedling"],
      correctAnswer: 1,
    },
    {
      questionText:
        "Ferritin is sometimes assessed in hair loss workups because iron status can affect hair cycling.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: 0,
    },
    {
      questionText: "A key red flag that warrants medical referral is:",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Mild dandruff", "Sudden patchy loss with scalp pain/inflammation", "Slow hair growth", "Dry ends"],
      correctAnswer: 1,
    },
    {
      questionText: "Name the transition phase between anagen and telogen.",
      questionType: QuestionType.SHORT_ANSWER,
      options: [],
      correctAnswer: "catagen",
    },
    {
      questionText: "Which statement best describes scarring alopecia?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["Follicles remain intact and regrow fully", "Follicles are destroyed and may not regrow", "It only affects eyebrows", "It is always caused by shampoo"],
      correctAnswer: 1,
    },
    {
      questionText: "Which is the best general principle for scalp care plans?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: ["One product fits all", "Treat the scalp condition + address triggers + review progress", "Never reassess", "Only use oils for inflammation"],
      correctAnswer: 1,
    },
  ] satisfies SeedQuestion[],
};

async function ensureQuizContainerCourse() {
  return prisma.course.upsert({
    where: { slug: "academy-quizzes" },
    update: {
      status: CourseStatus.PUBLISHED,
      category: "Quizzes",
      durationMinutes: 0,
    },
    create: {
      slug: "academy-quizzes",
      title: "Academy Quizzes",
      subtitle: "Quick knowledge checks to keep you sharp",
      description:
        "A library of standalone trichology quizzes. These are free for logged-in learners and designed to reinforce clinical fundamentals.",
      level: CourseLevel.GENERAL,
      enrollmentType: EnrollmentType.ON_DEMAND,
      status: CourseStatus.PUBLISHED,
      category: "Quizzes",
      durationMinutes: 0,
      learningOutcomes: [
        "Spot common patterns in hair loss presentations",
        "Understand key scalp conditions and first-line approaches",
        "Improve consultation structure and clinical reasoning",
      ],
      requirements: ["A curious mind", "Willingness to learn and apply"],
      targetAudience: ["Hair professionals", "Trichology learners", "Clinicians in scalp health"],
      faqs: [
        {
          question: "Are these quizzes paid?",
          answer:
            "No — these standalone quizzes are free for logged-in learners and are designed as practice and revision.",
        },
        {
          question: "Do quizzes replace the video courses?",
          answer:
            "No — video courses are deeper learning programs. Quizzes are quick knowledge checks to reinforce key concepts.",
        },
      ] as any,
    },
  });
}

async function ensureFeaturedPublicQuizQuestions(quizId: string, questions: SeedQuestion[]) {
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    await prisma.quizQuestion.upsert({
      where: { quizId_position: { quizId, position: i } },
      update: {
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options && q.options.length ? (q.options as any) : undefined,
        correctAnswer: q.correctAnswer as any,
        explanation: q.explanation ?? undefined,
        points: q.points ?? 1,
      },
      create: {
        quizId,
        position: i,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options && q.options.length ? (q.options as any) : undefined,
        correctAnswer: q.correctAnswer as any,
        explanation: q.explanation ?? undefined,
        points: q.points ?? 1,
      },
    });
  }
}

/**
 * Ensures the featured public quiz exists (useful for fresh/dev DBs where `prisma db seed`
 * hasn't been run yet). Returns `true` if an upsert was attempted.
 */
export async function ensureFeaturedPublicQuizExists(slug: string): Promise<boolean> {
  if (slug !== FEATURED_PUBLIC_QUIZ_SLUG) return false;

  const containerCourse = await ensureQuizContainerCourse();

  const recommendedCourse =
    (await prisma.course.findFirst({
      where: { status: CourseStatus.PUBLISHED, slug: { not: containerCourse.slug } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })) ?? null;

  const quiz = await prisma.quiz.upsert({
    where: { slug: FEATURED_PUBLIC_QUIZ_SLUG },
    update: {
      courseId: containerCourse.id,
      title: FEATURED_PUBLIC_QUIZ.title,
      description: FEATURED_PUBLIC_QUIZ.description,
      passingScore: FEATURED_PUBLIC_QUIZ.passingScore,
      status: QuizStatus.PUBLISHED,
      isPublic: true,
      resultsCopy: FEATURED_PUBLIC_QUIZ.resultsCopy as any,
      recommendedCourseId: recommendedCourse?.id ?? null,
    },
    create: {
      courseId: containerCourse.id,
      title: FEATURED_PUBLIC_QUIZ.title,
      description: FEATURED_PUBLIC_QUIZ.description,
      passingScore: FEATURED_PUBLIC_QUIZ.passingScore,
      status: QuizStatus.PUBLISHED,
      isPublic: true,
      slug: FEATURED_PUBLIC_QUIZ_SLUG,
      resultsCopy: FEATURED_PUBLIC_QUIZ.resultsCopy as any,
      recommendedCourseId: recommendedCourse?.id ?? null,
    },
  });

  await ensureFeaturedPublicQuizQuestions(quiz.id, FEATURED_PUBLIC_QUIZ.questions);
  return true;
}

