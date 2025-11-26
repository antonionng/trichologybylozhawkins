import { automationQueue, emailQueue } from "@/server/jobs/queues";
import { prisma } from "@/server/db/client";
import {
  audienceMemberUpsertSchema,
  audienceUpsertSchema,
  automationStepSchema,
  automationUpsertSchema,
  emailCampaignSchema,
  emailSendWebhookSchema,
} from "@/server/schema";
import {
  AutomationStatus,
  AutomationTriggerType,
  CampaignStatus,
  EmailSendStatus,
} from "@prisma/client";
import { z } from "zod";

const audienceMutationSchema = audienceUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertAudience = async (
  input: z.infer<typeof audienceMutationSchema>
) => {
  const data = audienceMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (id) {
    return prisma.audience.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.audience.create({ data: payload });
};

export const listAudiences = async () => {
  return prisma.audience.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
          campaigns: true,
        },
      },
    },
  });
};

export const listCampaigns = async () => {
  return prisma.emailCampaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      audience: true,
    },
  });
};

export const listAutomations = async () => {
  return prisma.automation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      audience: true,
      steps: {
        orderBy: { position: "asc" },
      },
    },
  });
};

const audienceMemberMutationSchema = audienceMemberUpsertSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertAudienceMember = async (
  input: z.infer<typeof audienceMemberMutationSchema>
) => {
  const data = audienceMemberMutationSchema.parse(input);
  const { id, audienceId, email, contactId, ...rest } = data;

  const baseData = {
    audienceId,
    email,
    contactId,
    ...rest,
  };

  if (id) {
    return prisma.audienceMember.update({
      where: { id },
      data: baseData,
    });
  }

  return prisma.audienceMember.upsert({
    where: {
      audienceId_email: { audienceId, email },
    },
    update: baseData,
    create: baseData,
  });
};

const campaignMutationSchema = emailCampaignSchema.extend({
  id: z.string().cuid().optional(),
});

export const upsertEmailCampaign = async (
  input: z.infer<typeof campaignMutationSchema>
) => {
  const data = campaignMutationSchema.parse(input);
  const { id, ...payload } = data;

  if (payload.status === CampaignStatus.SCHEDULED && !payload.scheduledFor) {
    throw new Error("Scheduled campaigns require a scheduledFor timestamp.");
  }

  if (id) {
    return prisma.emailCampaign.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.emailCampaign.create({ data: payload });
};

export const scheduleCampaignSend = async (campaignId: string) => {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: { audience: { include: { members: true } } },
  });

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.SCHEDULED },
  });

  const delay =
    campaign.scheduledFor && campaign.scheduledFor > new Date()
      ? Math.max(campaign.scheduledFor.getTime() - Date.now(), 0)
      : 0;

  await emailQueue.add(
    "send-campaign",
    { campaignId },
    {
      delay: delay > 0 ? delay : undefined,
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return campaign;
};

const automationStepInputSchema = automationStepSchema.omit({ automationId: true });

const automationMutationSchema = automationUpsertSchema.extend({
  id: z.string().cuid().optional(),
  steps: z.array(automationStepInputSchema).optional(),
});

export const upsertAutomation = async (
  input: z.infer<typeof automationMutationSchema>
) => {
  const data = automationMutationSchema.parse(input);
  const { id, steps = [], ...payload } = data;

  return prisma.$transaction(async (tx) => {
    const automation = id
      ? await tx.automation.update({
          where: { id },
          data: payload,
        })
      : await tx.automation.create({
          data: payload,
        });

    if (steps.length > 0) {
      await tx.automationStep.deleteMany({ where: { automationId: automation.id } });
      await tx.automationStep.createMany({
        data: steps.map((step) => ({
          ...step,
          automationId: automation.id,
        })),
      });
    }

    return automation;
  });
};

export const triggerAutomation = async (automationId: string, contactId: string) => {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId, status: AutomationStatus.ACTIVE },
  });

  if (!automation) {
    throw new Error("Automation is not active.");
  }

  const run = await prisma.automationRun.create({
    data: {
      automationId,
      contactId,
      status: "PENDING",
    },
  });

  await automationQueue.add(
    "run-automation",
    { automationRunId: run.id },
    {
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return run;
};

export const handleEmailWebhook = async (
  input: z.infer<typeof emailSendWebhookSchema>
) => {
  const data = emailSendWebhookSchema.parse(input);

  const statusMap: Record<string, EmailSendStatus> = {
    delivered: EmailSendStatus.DELIVERED,
    opened: EmailSendStatus.OPENED,
    clicked: EmailSendStatus.CLICKED,
    bounced: EmailSendStatus.BOUNCED,
    complained: EmailSendStatus.FAILED,
  };

  const send = await prisma.emailSend.findFirst({
    where: {
      campaignId: data.campaignId,
      OR: [
        { email: data.email },
        { audienceMember: { email: data.email } },
        { contact: { email: data.email } },
      ],
    },
  });

  if (!send) {
    return null;
  }

  return prisma.emailSend.update({
    where: { id: send.id },
    data: {
      status: statusMap[data.event],
      metadata: data.metadata,
    },
  });
};

