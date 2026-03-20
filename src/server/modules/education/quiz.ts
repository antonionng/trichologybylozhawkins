import { prisma } from "@/server/db/client";
import { QuizStatus, QuestionType } from "@prisma/client";
import { z } from "zod";

// Schemas
export const quizCreateSchema = z.object({
  courseId: z.string().cuid(),
  moduleId: z.string().cuid().optional(),
  lessonId: z.string().cuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(70),
  timeLimit: z.number().positive().optional(),
  isRequired: z.boolean().default(false),
  status: z.nativeEnum(QuizStatus).default(QuizStatus.DRAFT),
  isPublic: z.boolean().optional(),
  isFeaturedLead: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  resultsCopy: z.any().optional(),
  recommendedCourseId: z.string().cuid().nullable().optional(),
});

export const quizUpdateSchema = quizCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const questionCreateSchema = z.object({
  quizId: z.string().cuid(),
  position: z.number().min(0).default(0),
  questionText: z.string().min(1),
  questionType: z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  explanation: z.string().optional(),
  points: z.number().positive().default(1),
});

export const questionUpdateSchema = questionCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const attemptCreateSchema = z.object({
  quizId: z.string().cuid(),
  contactId: z.string().cuid(),
  answers: z.array(z.object({
    questionId: z.string().cuid(),
    answer: z.union([z.string(), z.number(), z.array(z.string())]),
  })),
});

// Quiz CRUD
export async function getQuizzes(courseId?: string) {
  return prisma.quiz.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      course: { select: { id: true, title: true, slug: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      questions: { orderBy: { position: "asc" } },
      _count: { select: { attempts: true } },
    },
  });
}

export async function createQuiz(input: z.infer<typeof quizCreateSchema>) {
  const data = quizCreateSchema.parse(input);
  return prisma.quiz.create({
    data,
    include: {
      course: { select: { id: true, title: true } },
    },
  });
}

export async function updateQuiz(input: z.infer<typeof quizUpdateSchema>) {
  const { id, ...data } = quizUpdateSchema.parse(input);
  return prisma.quiz.update({
    where: { id },
    data,
    include: {
      course: { select: { id: true, title: true } },
    },
  });
}

export async function deleteQuiz(id: string) {
  return prisma.quiz.delete({
    where: { id },
  });
}

// Question CRUD
export async function getQuestions(quizId: string) {
  return prisma.quizQuestion.findMany({
    where: { quizId },
    orderBy: { position: "asc" },
  });
}

export async function createQuestion(input: z.infer<typeof questionCreateSchema>) {
  const data = questionCreateSchema.parse(input);
  return prisma.quizQuestion.create({
    data: {
      quizId: data.quizId,
      position: data.position,
      questionText: data.questionText,
      questionType: data.questionType,
      options: data.options ?? [],
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      points: data.points,
    },
  });
}

export async function updateQuestion(input: z.infer<typeof questionUpdateSchema>) {
  const { id, ...data } = questionUpdateSchema.parse(input);
  return prisma.quizQuestion.update({
    where: { id },
    data: {
      ...data,
      options: data.options ?? undefined,
    },
  });
}

export async function deleteQuestion(id: string) {
  return prisma.quizQuestion.delete({
    where: { id },
  });
}

// Quiz Attempts
export async function submitQuizAttempt(input: z.infer<typeof attemptCreateSchema>) {
  const data = attemptCreateSchema.parse(input);
  
  // Get quiz with questions to grade
  const quiz = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    include: { questions: true },
  });
  
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  // Grade the attempt
  let score = 0;
  let maxScore = 0;
  const gradedAnswers = [];
  
  for (const question of quiz.questions) {
    maxScore += question.points;
    const answer = data.answers.find(a => a.questionId === question.id);
    
    let isCorrect = false;
    if (answer) {
      const correctAnswer = question.correctAnswer;
      if (typeof correctAnswer === "number") {
        isCorrect = answer.answer === correctAnswer;
      } else if (typeof correctAnswer === "string") {
        isCorrect = String(answer.answer).toLowerCase().trim() === 
                    String(correctAnswer).toLowerCase().trim();
      }
    }
    
    if (isCorrect) {
      score += question.points;
    }
    
    gradedAnswers.push({
      questionId: question.id,
      answer: answer?.answer ?? null,
      isCorrect,
    });
  }
  
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = percentage >= quiz.passingScore;
  
  return prisma.quizAttempt.create({
    data: {
      quizId: data.quizId,
      contactId: data.contactId,
      score,
      maxScore,
      percentage,
      passed,
      answers: gradedAnswers,
      completedAt: new Date(),
    },
    include: {
      quiz: { select: { title: true, passingScore: true } },
    },
  });
}

export async function getQuizAttempts(quizId: string) {
  return prisma.quizAttempt.findMany({
    where: { quizId },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContactAttempts(contactId: string) {
  return prisma.quizAttempt.findMany({
    where: { contactId },
    include: {
      quiz: { 
        select: { 
          id: true, 
          title: true, 
          course: { select: { title: true } } 
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

