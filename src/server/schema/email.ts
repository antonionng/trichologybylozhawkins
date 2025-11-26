import {
  AudienceMemberStatus,
  AudienceType,
  AutomationStatus,
  AutomationStepType,
  AutomationTriggerType,
  CampaignStatus,
} from "@prisma/client";
import { z } from "zod";

export const audienceUpsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(AudienceType).default(AudienceType.STANDARD),
  criteria: z.record(z.any()).optional(),
});

export const audienceMemberUpsertSchema = z.object({
  audienceId: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  contactId: z.string().cuid().optional(),
  status: z.nativeEnum(AudienceMemberStatus).default(AudienceMemberStatus.SUBSCRIBED),
});

export const emailCampaignSchema = z.object({
  audienceId: z.string().cuid(),
  name: z.string().min(1),
  subject: z.string().min(1),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  preheader: z.string().optional(),
  contentHtml: z.string().optional(),
  contentText: z.string().optional(),
  scheduledFor: z.coerce.date().optional(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  settings: z.record(z.any()).optional(),
});

export const emailSendWebhookSchema = z.object({
  campaignId: z.string(),
  event: z.enum(["delivered", "opened", "clicked", "bounced", "complained"]),
  email: z.string().email(),
  timestamp: z.coerce.date(),
  metadata: z.record(z.any()).optional(),
});

export const automationUpsertSchema = z.object({
  name: z.string().min(1),
  audienceId: z.string().cuid().optional(),
  status: z.nativeEnum(AutomationStatus).default(AutomationStatus.DRAFT),
  triggerType: z.nativeEnum(AutomationTriggerType),
  triggerConfig: z.record(z.any()),
});

export const automationStepSchema = z.object({
  automationId: z.string().cuid(),
  type: z.nativeEnum(AutomationStepType),
  name: z.string().min(1),
  position: z.number().int().min(0),
  config: z.record(z.any()),
});

export const automationRunEventSchema = z.object({
  automationId: z.string().cuid(),
  stepId: z.string().cuid().optional(),
  contactId: z.string().cuid().optional(),
  audienceMemberId: z.string().cuid().optional(),
  payload: z.record(z.any()).optional(),
});

export type AudienceUpsertInput = z.infer<typeof audienceUpsertSchema>;

