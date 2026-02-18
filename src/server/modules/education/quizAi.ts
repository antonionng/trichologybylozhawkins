import OpenAI from "openai";
import { z } from "zod";

export const quizAiFeedbackSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  recommendedCourseBlurb: z.string().optional(),
});

export type QuizAiFeedback = z.infer<typeof quizAiFeedbackSchema>;

type Input = {
  quizTitle: string;
  passingScore: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradedAnswers: Array<{
    questionText: string;
    questionType: string;
    answer: unknown;
    isCorrect: boolean;
  }>;
  recommendedCourse?: { title: string; slug: string } | null;
};

const extractResponseText = (response: any) => {
  if (!response?.output) return "";
  const chunks = Array.isArray(response.output)
    ? response.output
        .map((item: any) =>
          item.type === "output_text"
            ? item.text
            : item.content?.map((child: any) => child.text).filter(Boolean).join("\n")
        )
        .filter(Boolean)
    : [];
  return chunks.join("\n");
};

export async function generateQuizAiFeedback(input: Input): Promise<QuizAiFeedback | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const courseLine = input.recommendedCourse
    ? `Recommended course: ${input.recommendedCourse.title} (slug: ${input.recommendedCourse.slug})`
    : "Recommended course: none";

  const answerLines = input.gradedAnswers
    .slice(0, 30)
    .map((a, i) => {
      const answer = typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer);
      return [
        `Q${i + 1}: ${a.questionText}`,
        `Type: ${a.questionType}`,
        `Correct: ${a.isCorrect ? "yes" : "no"}`,
        `Answer: ${answer ?? "null"}`,
      ].join("\n");
    })
    .join("\n\n");

  const prompt = `
You are Lorraine Hawkins, a trichology educator. Write concise, supportive, expert feedback for a quiz taker.

Quiz: ${input.quizTitle}
Passing score: ${input.passingScore}%
Result: ${input.percentage.toFixed(0)}% (${input.score}/${input.maxScore}) — ${input.passed ? "PASSED" : "NOT PASSED"}
${courseLine}

Use the graded answers below to infer strengths and gaps. Do not mention “AI”.
Avoid medical diagnosis. Keep it educational and next-step oriented.
Return ONLY valid JSON matching this schema:
{
  "headline": string,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "nextSteps": string[],
  "recommendedCourseBlurb": string
}

Graded answers:
${answerLines}
  `.trim();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "quiz_ai_feedback",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            headline: { type: "string" },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            recommendedCourseBlurb: { type: "string" },
          },
          required: ["headline", "summary", "strengths", "gaps", "nextSteps", "recommendedCourseBlurb"],
        },
      },
    } as any,
  });

  const raw = extractResponseText(response).trim();
  if (!raw) return null;

  // Model should output JSON; parse and validate defensively.
  try {
    const json = JSON.parse(raw);
    const parsed = quizAiFeedbackSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

