import { aiQueue } from "@/server/jobs/queues";
import { prisma } from "@/server/db/client";
import { generateContentSchema, promptTemplateSchema } from "@/server/schema";
import { AIProvider, GenerationStatus } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";

const promptTemplateMutationSchema = promptTemplateSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertPromptTemplate = async (
  input: z.infer<typeof promptTemplateMutationSchema>
) => {
  const data = promptTemplateMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.promptTemplate.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.promptTemplate.create({
    data: payload,
  });
};

export const listPromptTemplates = async () => {
  return prisma.promptTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export const queueContentGeneration = async (
  input: z.infer<typeof generateContentSchema>
) => {
  const data = generateContentSchema.parse(input);

  const generation = await prisma.generatedContent.create({
    data: {
      templateId: data.templateId,
      requestedBy: data.requestedBy,
      input: {
        prompt: data.prompt,
        ...(data.input ?? {}),
      },
      status: GenerationStatus.PENDING,
    },
  });

  await aiQueue.add(
    "generate-content",
    { generationId: generation.id },
    { removeOnComplete: true, attempts: 2 }
  );

  return generation;
};

export const listGenerations = async (limit = 20) => {
  return prisma.generatedContent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      template: true,
    },
  });
};

export const runGeneration = async (generationId: string) => {
  const generation = await prisma.generatedContent.findUnique({
    where: { id: generationId },
    include: { template: true },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  const template = generation.template;

  const inputPayload = (generation.input ?? {}) as Record<string, unknown>;
  const promptSource = template
    ? template.template?.includes("{{prompt}}")
      ? template.template.replace(
          "{{prompt}}",
          String(inputPayload.prompt ?? "")
        )
      : template.template
    : undefined;
  const prompt = promptSource || String(inputPayload.prompt ?? "");

  if (!prompt) {
    throw new Error("No prompt available for generation.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const output =
      response.output?.[0]?.type === "output_text"
        ? response.output[0].text
        : JSON.stringify(response);

    return prisma.generatedContent.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.COMPLETED,
        output: { text: output },
        usage: response.usage as unknown as Record<string, unknown>,
      },
    });
  } catch (error) {
    return prisma.generatedContent.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
};

export const executeTemplatePreview = async (input: {
  templateId?: string;
  prompt: string;
}) => {
  const { templateId, prompt } = input;
  let promptText = prompt;

  if (templateId) {
    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    promptText = template.template?.includes("{{prompt}}")
      ? template.template.replace("{{prompt}}", prompt)
      : template.template;
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: promptText,
  });

  const output =
    response.output?.[0]?.type === "output_text"
      ? response.output[0].text
      : JSON.stringify(response);

  return {
    output,
    usage: response.usage as unknown as Record<string, unknown>,
  };
};

