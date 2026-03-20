import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/client";
import { getQuiz, updateQuiz, deleteQuiz, quizUpdateSchema } from "@/server/modules/education/quiz";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { quizId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const quiz = await getQuiz(params.quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const input = quizUpdateSchema.parse({ ...body, id: params.quizId });

    if (input.isFeaturedLead) {
      await prisma.quiz.updateMany({
        where: {
          isFeaturedLead: true,
          NOT: { id: params.quizId },
        },
        data: { isFeaturedLead: false },
      });
      await prisma.videoProduct.updateMany({
        where: { isFreeOnSignup: true },
        data: { isFreeOnSignup: false },
      });
    }

    const quiz = await updateQuiz(input);
    revalidatePath("/");
    revalidatePath("/education");
    revalidatePath("/academy");
    revalidatePath(`/quiz/${quiz.slug ?? ""}`);
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update quiz" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await deleteQuiz(params.quizId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete quiz" },
      { status: 400 }
    );
  }
}

