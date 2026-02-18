import { aiQueue } from "@/server/jobs/queues";
import { isRedisHealthy } from "@/server/jobs/connection";
import { triggerPostImageGeneration } from "./service";

export type PostImageGenerationMode = "queued" | "inline";

export type PostImageGenerationResult = {
  mode: PostImageGenerationMode;
  reason?: "redis_unavailable" | "enqueue_failed";
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

/**
 * Request post image generation.
 *
 * - If Redis is healthy, enqueue a BullMQ job (fast).
 * - If Redis is not healthy and we're not in production, run inline so local dev works.
 * - If Redis is not healthy in production, throw a clear error.
 */
export async function requestPostImageGeneration(slotId: string): Promise<PostImageGenerationResult> {
  const isProd = process.env.NODE_ENV === "production";

  const healthy = await isRedisHealthy({ timeoutMs: 500 });
  if (healthy) {
    try {
      await withTimeout(
        aiQueue.add(
          "generate-post-image",
          { slotId },
          { removeOnComplete: true, attempts: 3 }
        ),
        1200
      );
      return { mode: "queued" };
    } catch (error) {
      if (!isProd) {
        await triggerPostImageGeneration(slotId);
        return { mode: "inline", reason: "enqueue_failed" };
      }
      throw error;
    }
  }

  if (!isProd) {
    await triggerPostImageGeneration(slotId);
    return { mode: "inline", reason: "redis_unavailable" };
  }

  throw new Error("Redis unavailable; cannot queue image generation.");
}

