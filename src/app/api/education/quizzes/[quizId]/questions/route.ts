import { NextResponse } from "next/server";
import { getQuestions, createQuestion, questionCreateSchema } from "@/server/modules/education/quiz";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { quizId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const questions = await getQuestions(params.quizId);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const question = await createQuestion(
      questionCreateSchema.parse({ ...body, quizId: params.quizId })
    );
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create question" },
      { status: 400 }
    );
  }
}

