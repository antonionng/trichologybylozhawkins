import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { monthlyAutopilotRequestSchema } from "@/server/schema";
import OpenAI from "openai";
import { ContentChannel, ContentSlotStatus } from "@prisma/client";
import { queueContentGeneration } from "@/server/modules/ai/service";
import { apiErrorResponse } from "@/server/http/errors";
import { requireUser } from "@/server/security/auth";

type AutopilotItem = {
  date: string; // YYYY-MM-DD
  channel: ContentChannel;
  title: string;
  prompt: string;
  persona?: string;
  campaign?: string;
};

const MONTHLY_AUTOPILOT_SCHEMA = {
  name: "monthly_autopilot_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        minItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            date: { type: "string" },
            channel: { type: "string" },
            title: { type: "string" },
            prompt: { type: "string" },
            persona: { type: "string" },
            campaign: { type: "string" },
          },
          // OpenAI json_schema requires `required` to include EVERY key in `properties`.
          // Use empty string defaults for persona/campaign when not applicable.
          required: ["date", "channel", "title", "prompt", "persona", "campaign"],
        },
      },
    },
    required: ["items"],
  },
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

const safeJsonParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const monthLabel = (month: string) => {
  const [year, mon] = month.split("-");
  return `${year}-${mon}`;
};

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = monthlyAutopilotRequestSchema.parse(body);

    const volume = data.volume ?? 20;
    const month = data.month;
    const timezone = data.timezone;
    const channels = data.channels;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const theme = data.theme ? `Theme: ${data.theme}` : "";
    const brief = data.brief ? `Assistant brief (natural language): ${data.brief}` : "";
    const themeBlocks = data.themeBlocks?.length
      ? `Theme blocks: ${JSON.stringify(data.themeBlocks)}`
      : "";
    const mix = data.mix ? `Content mix targets: ${JSON.stringify(data.mix)}` : "";
    const promotions = data.promotions?.length
      ? `Promotions to weave in: ${JSON.stringify(data.promotions)}`
      : "";
    const persona = data.persona ? `Default persona: ${data.persona}` : "";
    const campaign = data.campaign ? `Default campaign: ${data.campaign}` : "";
    const goals = data.goals?.length ? `Goals: ${data.goals.join(", ")}` : "Goals: consultations and education sales";
    const tone = data.tone?.length ? `Tone: ${data.tone.join(", ")}` : "Tone: warm, expert, premium, practical";

    const prompt = `
You are Lorraine Hawkins' content director. Build a full month of social content.

Constraints:
- Month: ${month} (YYYY-MM)
- Timezone: ${timezone}
- Total items: ${volume}
- Allowed channels: ${channels.join(", ")}
- Spread items across the month with a natural cadence (no clustering).
- For each item, provide: date (YYYY-MM-DD), channel, title, and a detailed generation prompt.
- Prompts must be specific: hook, structure, what to say, and include an explicit CTA.
- Avoid repetitive topics; keep variety: education, myths, routines, case-study style, product/service CTA, behind-the-scenes.
- The plan must feel like a trichology marketing expert: science-backed, premium, and helpful. Sales should be woven in softly (no spam).

${theme}
${brief}
${themeBlocks}
${mix}
${promotions}
${persona}
${campaign}
${goals}
${tone}
    `.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: MONTHLY_AUTOPILOT_SCHEMA.name,
          schema: MONTHLY_AUTOPILOT_SCHEMA.schema,
        },
      } as any,
    });

    const outputText = extractResponseText(response) || JSON.stringify(response.output ?? {});
    const parsed = safeJsonParse<{ items: AutopilotItem[] }>(outputText);
    const items = parsed?.items ?? [];

    if (!items.length) {
      throw new Error("Autopilot planner returned no items. Please retry.");
    }

    const planName = `${monthLabel(month)} Autopilot`;

    const plan = await prisma.contentPlan.create({
      data: {
        name: planName,
        description: "AI generated monthly autopilot plan",
        timezone,
        tags: {
          autopilot: true,
          month,
          channels,
          volume,
          theme: data.theme ?? null,
          brief: data.brief ?? null,
          themeBlocks: data.themeBlocks ?? null,
          mix: data.mix ?? null,
          promotions: data.promotions ?? null,
        },
      },
    });

    const slots = await prisma.$transaction(
      items.slice(0, volume).map((item) =>
        prisma.contentSlot.create({
          data: {
            planId: plan.id,
            title: item.title,
            brief: item.prompt,
            persona: item.persona ?? data.persona ?? null,
            campaign: item.campaign ?? data.campaign ?? null,
            channel: item.channel,
            scheduledFor: new Date(`${item.date}T10:00:00Z`),
            status: ContentSlotStatus.DRAFT,
            metadata: {
              autopilot: true,
              month,
              timezone,
              planned: { date: item.date },
            },
          },
        })
      )
    );

    await Promise.all(
      slots.map((slot) =>
        queueContentGeneration({
          prompt: slot.brief ?? `Create a ${slot.channel} post titled: ${slot.title}`,
          input: { prompt: slot.brief ?? "" },
          mode: "content-factory",
          slotId: slot.id,
          persona: slot.persona ?? undefined,
          campaign: slot.campaign ?? undefined,
          channels: [slot.channel],
          tone: data.tone,
          goals: data.goals,
          variants: 1,
          media: data.includeImages === false ? { kind: "none" } : { kind: "image" },
        })
      )
    );

    return NextResponse.json({
      plan,
      slots,
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to generate monthly autopilot plan");
  }
}


