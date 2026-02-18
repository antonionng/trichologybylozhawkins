import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  topic: z.string().min(3),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
  numQuestions: z.number().int().min(3).max(25).default(10),
  mode: z.enum(["questions", "full"]).default("questions"),
  titleHint: z.string().optional(),
});

type QuizBuilderResponse = {
  title?: string;
  description?: string;
  questions: Array<{
    questionText: string;
    questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: number | string;
    explanation?: string;
    points?: number;
  }>;
};

const responseSchema = {
  name: "quiz_builder_generation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      questions: {
        type: "array",
        minItems: 3,
        maxItems: 25,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            questionText: { type: "string" },
            questionType: {
              type: "string",
              enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
            },
            options: {
              type: "array",
              items: { type: "string" },
            },
            correctAnswer: {
              oneOf: [{ type: "number" }, { type: "string" }],
            },
            explanation: { type: "string" },
            points: { type: "number" },
          },
          required: ["questionText", "questionType", "correctAnswer"],
        },
      },
    },
    required: ["questions"],
  },
} as const;

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

const safeJsonParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });

    const body = await request.json();
    const input = requestSchema.parse(body);

    const titleLine =
      input.mode === "full"
        ? `Also propose a quiz title and a 1-2 sentence description. Title hint: ${input.titleHint ?? "—"}.`
        : "Do not propose a title or description.";

    const prompt = `You are Lorraine Hawkins' lead trichology educator. Create a high-quality knowledge quiz.

Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of questions: ${input.numQuestions}

Constraints:
- Keep questions clinically accurate and practical.
- Use mostly MULTIPLE_CHOICE, with a small number of TRUE_FALSE and SHORT_ANSWER.
- MULTIPLE_CHOICE: provide exactly 4 options. correctAnswer must be the 0-based index (0-3).
- TRUE_FALSE: correctAnswer must be 0 for True or 1 for False.
- SHORT_ANSWER: correctAnswer must be a short string (1-6 words).
- Provide 1-2 sentence explanation where helpful.
- Default points to 1 unless a question is meaningfully harder.

${titleLine}

Return JSON only that matches the provided schema.`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_schema", json_schema: responseSchema as any },
    });

    const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
    const structured = safeJsonParse<QuizBuilderResponse>(outputText);

    if (!structured?.questions?.length) {
      return NextResponse.json({ error: "AI returned invalid quiz JSON" }, { status: 400 });
    }

    // Soft-normalize shape
    const questions = structured.questions.slice(0, input.numQuestions).map((q) => ({
      questionText: String(q.questionText ?? "").trim(),
      questionType: q.questionType,
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ? String(q.explanation) : undefined,
      points: typeof q.points === "number" && q.points > 0 ? q.points : 1,
    }));

    const payload: QuizBuilderResponse = {
      ...(input.mode === "full" ? { title: structured.title, description: structured.description } : {}),
      questions,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 400 }
    );
  }
}

