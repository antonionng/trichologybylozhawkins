import { NextResponse } from "next/server";
import { getQuizzes, createQuiz, quizCreateSchema } from "@/server/modules/education/quiz";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;
    
    const quizzes = await getQuizzes(courseId);
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quiz = await createQuiz(quizCreateSchema.parse(body));
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quiz" },
      { status: 400 }
    );
  }
}

