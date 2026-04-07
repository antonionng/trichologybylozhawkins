import { Worker, Job } from "bullmq";
import { getRedisConnection } from "./connection";
import {
  AutomationJobData,
  EmailJobData,
  FulfillmentJobData,
  AiJobData,
  PostImageJobData,
} from "./queues";
import { prisma } from "@/server/db/client";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";
import { runGeneration, triggerPostImageGeneration } from "@/server/modules/ai/service";
import { Resend } from "resend";
import { brandedEmailHtml, brandedEmailTextPreamble } from "@/server/modules/email/transactional";

const queuePrefix = process.env.QUEUE_PREFIX ?? "lorraine-platform";
const connection = getRedisConnection();

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const defaultFrom =
  process.env.RESEND_FROM_EMAIL ||
  "Lorraine Hawkins <no-reply@trichologybylorrainehawkins.co.uk>";

const campaignAppUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

const emailHandler = async (job: Job<EmailJobData>) => {
  if (job.name === "send-campaign") {
    if (!resendClient) {
      throw new Error("RESEND_API_KEY is not configured. Campaign sending cannot run.");
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: job.data.campaignId },
      include: {
        audience: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: "SENDING", sentAt: new Date() },
    });

    const fromHeader = campaign.fromEmail
      ? `${campaign.fromName ?? "Lorraine Hawkins"} <${campaign.fromEmail}>`
      : defaultFrom;

    let failed = 0;
    for (const member of campaign.audience.members) {
      try {
        const innerHtml =
          campaign.contentHtml ??
          `<p>${escapeHtml(campaign.subject)}</p><p>${escapeHtml(campaign.name)}</p>`;
        const innerText =
          campaign.contentText ??
          `${campaign.subject}\n\n${campaign.name}\n\nLorraine Hawkins`;

        const result = await resendClient.emails.send({
          from: fromHeader,
          to: member.email,
          subject: campaign.subject,
          html: brandedEmailHtml(campaignAppUrl, innerHtml),
          text: `${brandedEmailTextPreamble(campaignAppUrl)}\n${innerText}`,
          ...(campaign.replyTo ? { reply_to: campaign.replyTo } : {}),
        });

        if (result.error) {
          throw new Error(`Resend: ${result.error.message} (${result.error.name})`);
        }

        await prisma.emailSend.upsert({
          where: {
            campaignId_audienceMemberId: {
              campaignId: campaign.id,
              audienceMemberId: member.id,
            },
          },
          update: {
            status: "SENT",
            sentAt: new Date(),
            email: member.email,
            metadata: { provider: "resend", messageId: result.data?.id ?? null } as any,
          },
          create: {
            campaignId: campaign.id,
            audienceMemberId: member.id,
            email: member.email,
            status: "SENT",
            sentAt: new Date(),
            metadata: { provider: "resend", messageId: result.data?.id ?? null } as any,
          },
        });
      } catch (error) {
        failed += 1;
        await prisma.emailSend.upsert({
          where: {
            campaignId_audienceMemberId: {
              campaignId: campaign.id,
              audienceMemberId: member.id,
            },
          },
          update: {
            status: "FAILED",
            email: member.email,
            metadata: {
              provider: "resend",
              error: error instanceof Error ? error.message : "send_failed",
            } as any,
          },
          create: {
            campaignId: campaign.id,
            audienceMemberId: member.id,
            email: member.email,
            status: "FAILED",
            metadata: {
              provider: "resend",
              error: error instanceof Error ? error.message : "send_failed",
            } as any,
          },
        });
      }
    }

    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: failed > 0 ? "CANCELLED" : "SENT" },
    });
  }
};

const automationHandler = async (
  job: Job<AutomationJobData>
) => {
  const run = await prisma.automationRun.update({
    where: { id: job.data.automationRunId },
    data: { status: "RUNNING", startedAt: new Date() },
    include: {
      automation: {
        include: { steps: { orderBy: { position: "asc" } } },
      },
    },
  });

  for (const step of run.automation.steps) {
    await prisma.automationEvent.create({
      data: {
        automationRunId: run.id,
        stepId: step.id,
        status: "SUCCESS",
        occurredAt: new Date(),
        payload: step.config as any,
      },
    });
  }

  await prisma.automationRun.update({
    where: { id: run.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
};

const aiHandler = async (job: Job<AiJobData | PostImageJobData>) => {
  if (job.name === "generate-post-image") {
    const data = job.data as PostImageJobData;
    await triggerPostImageGeneration(data.slotId);
  } else {
    const data = job.data as AiJobData;
    await runGeneration(data.generationId);
  }
};

const fulfillmentHandler = async (
  job: Job<FulfillmentJobData>
) => {
  await handleCheckoutFulfillment({
    providerSessionId: job.data.providerSessionId,
    status: "succeeded",
  });
};

export const emailWorker = new Worker<EmailJobData>("email", emailHandler, {
  connection,
  prefix: queuePrefix,
});

export const automationWorker = new Worker<AutomationJobData>(
  "automation",
  automationHandler,
  {
    connection,
    prefix: queuePrefix,
  }
);

export const aiWorker = new Worker<AiJobData | PostImageJobData>("ai", aiHandler, {
  connection,
  prefix: queuePrefix,
});

export const fulfillmentWorker = new Worker<FulfillmentJobData>(
  "fulfillment",
  fulfillmentHandler,
  {
  connection,
  prefix: queuePrefix,
  }
);

const handleWorkerError = (worker: Worker) => {
  worker.on("error", (error) => {
    console.error(`[worker:${worker.name}]`, error);
  });
};

[emailWorker, automationWorker, aiWorker, fulfillmentWorker].forEach(handleWorkerError);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

