import { Queue } from "bullmq";
import { getRedisConnection, isRedisHealthy } from "./connection";
import { QueueUnavailableError } from "./errors";

const QUEUE_PREFIX = process.env.QUEUE_PREFIX ?? "lorraine-platform";

const disabledQueue = (name: string) =>
  ({
    name,
    add: async () => {
      throw new QueueUnavailableError(
        name,
        "build_time_disabled",
        `Queue '${name}' is disabled during build or pre-render.`
      );
    },
    addBulk: async () => {
      throw new QueueUnavailableError(
        name,
        "build_time_disabled",
        `Queue '${name}' is disabled during build or pre-render.`
      );
    },
    close: async () => {},
  }) as unknown as Queue;

const lazyQueue = (name: string) => {
  let realQueue: Queue | null = null;
  let creating: Promise<Queue> | null = null;

  const getOrCreate = async (): Promise<Queue> => {
    if (realQueue) return realQueue;
    if (creating) return creating;

    creating = (async () => {
      const connection = getRedisConnection();
      if (!connection) {
        // Build-time (or explicitly disabled connection).
        return disabledQueue(name);
      }

      const healthy = await isRedisHealthy({ timeoutMs: 500 });
      if (!healthy) {
        throw new QueueUnavailableError(
          name,
          "redis_unreachable",
          `Queue '${name}' is unavailable because Redis is not reachable.`
        );
      }

      realQueue = new Queue(name, { connection, prefix: QUEUE_PREFIX });
      return realQueue;
    })().finally(() => {
      creating = null;
    });

    return creating;
  };

  return {
    name,
    add: async (...args: Parameters<Queue["add"]>) => {
      const q = await getOrCreate();
      return q.add(...args);
    },
    addBulk: async (...args: Parameters<Queue["addBulk"]>) => {
      const q = await getOrCreate();
      return q.addBulk(...args);
    },
    close: async () => {
      if (realQueue) {
        await realQueue.close();
      }
    },
  } as unknown as Queue;
};

export const emailQueue = lazyQueue("email");
export const automationQueue = lazyQueue("automation");
export const aiQueue = lazyQueue("ai");
export const fulfillmentQueue = lazyQueue("fulfillment");

export type EmailJobData = { campaignId: string };
export type AutomationJobData = { automationRunId: string };
export type AiJobData = { generationId: string };
export type PostImageJobData = { slotId: string };
export type FulfillmentJobData = { providerSessionId: string };

