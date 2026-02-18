import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { submitQuizAttempt } from "@/server/modules/education/quiz";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";
import { generateQuizAiFeedback } from "@/server/modules/education/quizAi";
import { getQuizUpsellCoursesWithReasons } from "@/server/modules/education/recommendations";
import { ActivityType } from "@prisma/client";
import { sendNewQuizLeadEmail, sendQuizResultEmail } from "@/server/modules/email/transactional";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.array(z.string())]),
    })
  ),
});

type ResultsCopyBand = { headline?: string; body?: string };
type ResultsCopy = { low?: ResultsCopyBand; medium?: ResultsCopyBand; high?: ResultsCopyBand };

function bandFromPercentage(percentage: number): "low" | "medium" | "high" {
  if (percentage >= 80) return "high";
  if (percentage >= 50) return "medium";
  return "low";
}

function pickCopy(resultsCopy: unknown, band: "low" | "medium" | "high"): ResultsCopyBand | null {
  if (!resultsCopy || typeof resultsCopy !== "object") return null;
  const rc = resultsCopy as ResultsCopy;
  return rc[band] ?? null;
}

function splitName(full: string) {
  const trimmed = full.trim().replace(/\s+/g, " ");
  const [first, ...rest] = trimmed.split(" ");
  return { firstName: first || "Learner", lastName: rest.join(" ") || "" };
}

interface RouteParams {
  params: { slug: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const data = submitSchema.parse(body);

    // If the DB is fresh and seeding hasn't been run, bootstrap the featured public quiz on-demand.
    await ensureFeaturedPublicQuizExists(params.slug);

    const quiz = await prisma.quiz.findUnique({
      where: { slug: params.slug },
      include: {
        recommendedCourse: { select: { id: true, title: true, slug: true } },
        questions: {
          orderBy: { position: "asc" },
          select: { id: true, position: true, questionText: true, questionType: true },
        },
      },
    });

    if (!quiz || !quiz.isPublic || quiz.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const email = data.email.toLowerCase();
    const { firstName, lastName } = splitName(data.name);

    const contact = await prisma.contact.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        source: "quiz",
      },
      create: {
        email,
        firstName,
        lastName,
        source: "quiz",
      },
    });

    const attempt = await submitQuizAttempt({
      quizId: quiz.id,
      contactId: contact.id,
      answers: data.answers,
    });

    const attemptAnswers = Array.isArray(attempt.answers) ? (attempt.answers as any[]) : [];
    const gradedAnswers = quiz.questions.map((q) => {
      const a = attemptAnswers.find((x) => x?.questionId === q.id);
      return {
        questionText: q.questionText,
        questionType: String(q.questionType),
        answer: a?.answer ?? null,
        isCorrect: Boolean(a?.isCorrect),
      };
    });

    const aiFeedback = await generateQuizAiFeedback({
      quizTitle: quiz.title,
      passingScore: quiz.passingScore,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      passed: attempt.passed,
      gradedAnswers,
      recommendedCourse: quiz.recommendedCourse
        ? { title: quiz.recommendedCourse.title, slug: quiz.recommendedCourse.slug }
        : null,
    });

    const updatedAttempt = aiFeedback
      ? await prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: { aiFeedback: aiFeedback as any },
        })
      : attempt;

    // CRM audit trail for Lorraine
    await prisma.activity.create({
      data: {
        type: ActivityType.NOTE,
        contactId: contact.id,
        subject: `Quiz completed: ${quiz.title}`,
        body: [
          `Result: ${updatedAttempt.percentage.toFixed(0)}% (${updatedAttempt.score}/${updatedAttempt.maxScore}) — ${updatedAttempt.passed ? "PASSED" : "NOT PASSED"}`,
          aiFeedback?.headline ? `Headline: ${aiFeedback.headline}` : null,
          aiFeedback?.summary ? `Summary: ${aiFeedback.summary}` : null,
          `AttemptId: ${updatedAttempt.id}`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Transactional emails (safe no-op if RESEND_API_KEY missing)
    await Promise.allSettled([
      sendQuizResultEmail({
        to: contact.email,
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        quizTitle: quiz.title,
        percentage: updatedAttempt.percentage,
        score: updatedAttempt.score,
        maxScore: updatedAttempt.maxScore,
        passed: updatedAttempt.passed,
        aiFeedback: aiFeedback ?? undefined,
        recommendedCourse: quiz.recommendedCourse
          ? { title: quiz.recommendedCourse.title, slug: quiz.recommendedCourse.slug }
          : null,
        appUrl,
      }),
      sendNewQuizLeadEmail({
        to: "ag@experrt.com",
        contactId: contact.id,
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email,
        quizTitle: quiz.title,
        percentage: updatedAttempt.percentage,
        passed: updatedAttempt.passed,
        aiHeadline: aiFeedback?.headline ?? null,
        appUrl,
      }),
    ]);

    // Record email touchpoints in CRM timeline (even if delivery is skipped in dev).
    await prisma.activity.createMany({
      data: [
        {
          type: ActivityType.EMAIL,
          contactId: contact.id,
          subject: `Quiz results email: ${quiz.title}`,
          body: `Sent to: ${contact.email}`,
        },
        {
          type: ActivityType.EMAIL,
          contactId: contact.id,
          subject: `Admin notification: new quiz lead`,
          body: `Sent to: ag@experrt.com`,
        },
      ],
    });

    const band = bandFromPercentage(attempt.percentage);
    const resultCopy = pickCopy(quiz.resultsCopy, band);
    const recommendedCourses = await getQuizUpsellCoursesWithReasons({
      quizId: quiz.id,
      band,
      aiFeedback: aiFeedback ?? null,
    });

    return NextResponse.json({
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      passed: attempt.passed,
      answers: attempt.answers,
      band,
      resultCopy,
      aiFeedback,
      recommendedCourses,
      recommendedCourse: quiz.recommendedCourse
        ? {
            id: quiz.recommendedCourse.id,
            title: quiz.recommendedCourse.title,
            slug: quiz.recommendedCourse.slug,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit quiz" },
      { status: 400 }
    );
  }
}

