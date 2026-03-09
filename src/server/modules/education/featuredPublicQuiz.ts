import { CourseLevel, CourseStatus, EnrollmentType, QuestionType, QuizStatus } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { FEATURED_PUBLIC_QUIZ_SLUG } from "@/lib/publicQuiz";
import { getFeaturedPublicScalpQuizContent } from "@/server/modules/education/publicScalpQuiz";

type SeedQuestion = {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
};

const FEATURED_PUBLIC_QUIZ = getFeaturedPublicScalpQuizContent();

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

