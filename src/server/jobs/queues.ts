import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";

const QUEUE_PREFIX = process.env.QUEUE_PREFIX ?? "bunny-platform";

const connectionOptions = {
  connection: getRedisConnection(),
  prefix: QUEUE_PREFIX,
};

export const emailQueue = new Queue("email", connectionOptions);
export const automationQueue = new Queue("automation", connectionOptions);
export const aiQueue = new Queue("ai", connectionOptions);
export const fulfillmentQueue = new Queue("fulfillment", connectionOptions);

export type EmailJobData = { campaignId: string };
export type AutomationJobData = { automationRunId: string };
export type AiJobData = { generationId: string };
export type FulfillmentJobData = { providerSessionId: string };

