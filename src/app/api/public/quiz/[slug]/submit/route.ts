import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { submitQuizAttempt } from "@/server/modules/education/quiz";
import { ensureFeaturedPublicQuizExists } from "@/server/modules/education/featuredPublicQuiz";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";
import { generateQuizAiFeedback } from "@/server/modules/education/quizAi";
import { getQuizUpsellCoursesWithReasons } from "@/server/modules/education/recommendations";
import { getCurrentSession } from "@/server/security/auth";
import { ActivityType } from "@prisma/client";
import { sendNewQuizLeadEmail, sendQuizResultEmail } from "@/server/modules/email/transactional";
import {
  buildPublicScalpQuizSubmission,
  getPublicScalpQuizLeadSummary,
  isFeaturedPublicScalpQuiz,
} from "@/server/modules/education/publicScalpQuiz";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
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

function buildQuizSignupPath(slug: string) {
  return `/academy/signup?next=${encodeURIComponent(`/quiz/${slug}?unlock=1`)}`;
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

    const [featuredLeadItem, session] = await Promise.all([
      getCurrentFeaturedLeadItem(),
      getCurrentSession(),
    ]);
    const isFeaturedLeadQuiz =
      featuredLeadItem?.kind === "QUIZ" && featuredLeadItem.slug === params.slug;

    if (isFeaturedLeadQuiz && !session && (!data.name || !data.email)) {
      return NextResponse.json({
        requiresSignup: true,
        teaserTitle: "Your full results are ready",
        teaserBody:
          "Create your free academy account to unlock your personalised guidance, next steps, and recommended training.",
        signupPath: buildQuizSignupPath(params.slug),
      });
    }

    let contact;

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.uid },
        include: {
          contact: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (user.contact) {
        contact = user.contact;
      } else {
        contact = await prisma.contact.upsert({
          where: { email: user.email.toLowerCase() },
          update: {
            source: "quiz",
          },
          create: {
            email: user.email.toLowerCase(),
            firstName: "Learner",
            lastName: "",
            source: "quiz",
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { contactId: contact.id },
        });
      }
    } else {
      if (!data.name || !data.email) {
        return NextResponse.json(
          { error: "Name and email are required to unlock your results" },
          { status: 400 },
        );
      }

      const email = data.email.toLowerCase();
      const { firstName, lastName } = splitName(data.name);

      contact = await prisma.contact.upsert({
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
    }

    if (isFeaturedPublicScalpQuiz(params.slug)) {
      const submission = buildPublicScalpQuizSubmission({
        quizQuestions: quiz.questions.map((question) => ({
          id: question.id,
          position: question.position,
          questionText: question.questionText,
        })),
        answers: data.answers,
      });

      const concernScore = submission.result.scoreBreakdown[submission.result.primaryConcern.key] ?? 0;
      const maxScore = Object.values(submission.result.scoreBreakdown).reduce((sum, value) => sum + value, 0);
      const percentage = maxScore > 0 ? (concernScore / maxScore) * 100 : 0;
      const passed = submission.result.triage !== "prompt";

      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          contactId: contact.id,
          score: concernScore,
          maxScore,
          percentage,
          passed,
          answers: submission.attemptAnswers as any,
          aiFeedback: {
            headline: submission.result.headline,
            summary: submission.result.summary,
            nextSteps: submission.result.nextSteps,
            redFlags: submission.result.redFlags,
            primaryConcern: submission.result.primaryConcern,
            secondaryConcern: submission.result.secondaryConcern,
            triage: submission.result.triage,
          } as any,
          completedAt: new Date(),
        },
      });

      await prisma.activity.create({
        data: {
          type: ActivityType.NOTE,
          contactId: contact.id,
          subject: `Scalp quiz completed: ${quiz.title}`,
          body: [
            getPublicScalpQuizLeadSummary(submission.result),
            submission.result.redFlags.length ? `Red flags: ${submission.result.redFlags.join(", ")}` : null,
            `AttemptId: ${attempt.id}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      });

      return NextResponse.json({
        resultMode: submission.result.resultMode,
        headline: submission.result.headline,
        summary: submission.result.summary,
        triage: submission.result.triage,
        primaryConcern: submission.result.primaryConcern,
        secondaryConcern: submission.result.secondaryConcern,
        nextSteps: submission.result.nextSteps,
        redFlags: submission.result.redFlags,
        bookingCta: submission.result.bookingCta,
        secondaryCta: submission.result.secondaryCta,
        answers: submission.attemptAnswers,
        score: concernScore,
        maxScore,
        percentage,
        passed,
      });
    }

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

