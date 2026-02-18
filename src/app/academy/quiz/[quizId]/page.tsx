export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

interface Props {
  params: { quizId: string };
}

export default async function QuizPage({ params }: Props) {
  // Backwards-compatible redirect (old route) -> new login-only standalone quiz route.
  redirect(`/academy/quizzes/${params.quizId}`);
}

