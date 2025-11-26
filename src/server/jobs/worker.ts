import { Worker, Job } from "bullmq";
import { getRedisConnection } from "./connection";
import {
  AutomationJobData,
  EmailJobData,
  FulfillmentJobData,
  AiJobData,
} from "./queues";
import { prisma } from "@/server/db/client";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";
import { runGeneration } from "@/server/modules/ai/service";

const queuePrefix = process.env.QUEUE_PREFIX ?? "bunny-platform";
const connection = getRedisConnection();

const emailHandler = async (job: Job<EmailJobData>) => {
  if (job.name === "send-campaign") {
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

    for (const member of campaign.audience.members) {
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
        },
        create: {
          campaignId: campaign.id,
          audienceMemberId: member.id,
          email: member.email,
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: "SENT" },
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

const aiHandler = async (job: Job<AiJobData>) => {
  await runGeneration(job.data.generationId);
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

export const aiWorker = new Worker<AiJobData>("ai", aiHandler, {
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

