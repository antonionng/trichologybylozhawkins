import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";
import { getQuizUpsellCoursesWithReasons } from "@/server/modules/education/recommendations";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { quizId: string };
}

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.array(z.string())]),
    })
  ),
});

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const data = submitSchema.parse(body);

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId, status: "PUBLISHED" },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade the attempt
    let score = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    for (const question of quiz.questions) {
      maxScore += question.points;
      const answer = data.answers.find((a) => a.questionId === question.id);

      let isCorrect = false;
      if (answer) {
        const correctAnswer = question.correctAnswer;
        if (typeof correctAnswer === "number") {
          isCorrect = answer.answer === correctAnswer;
        } else if (typeof correctAnswer === "string") {
          isCorrect =
            String(answer.answer).toLowerCase().trim() ===
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

    const band = percentage >= 80 ? "high" : percentage >= 50 ? "medium" : "low";

    // For now, we'll return the result without saving (no auth)
    // In production, you'd save to QuizAttempt with the authenticated user's contactId
    const recommendedCourses = await getQuizUpsellCoursesWithReasons({
      quizId: quiz.id,
      band,
      aiFeedback: null,
    });

    return NextResponse.json({
      score,
      maxScore,
      percentage,
      passed,
      answers: gradedAnswers,
      band,
      recommendedCourses,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit quiz" },
      { status: 400 }
    );
  }
}

