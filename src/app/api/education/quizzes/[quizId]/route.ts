import { NextResponse } from "next/server";
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
    const quiz = await updateQuiz(quizUpdateSchema.parse({ ...body, id: params.quizId }));
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

