import IORedis from "ioredis";
import { getServerEnv } from "@/server/schema";

let redis: IORedis | null = null;

const isBuildTime = () =>
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";

export const getRedisConnection = () => {
  // Skip Redis connection during build time
  if (isBuildTime()) {
    return null as any;
  }
  
  if (!redis) {
    const env = getServerEnv();
    if (!env.REDIS_URL) {
      return null as any;
    }
    redis = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      // Reduce noisy logs / hot loops when Redis is down locally; still retry in prod.
      retryStrategy: (times) => {
        const isProd = process.env.NODE_ENV === "production";
        if (isProd) return Math.min(times * 200, 2000);
        // In dev, back off quickly and avoid spamming.
        return Math.min(times * 500, 3000);
      },
    });
  }

  return redis;
};

export type RedisConnection = ReturnType<typeof getRedisConnection>;

type RedisHealthOptions = {
  timeoutMs?: number;
  force?: boolean;
};

const HEALTH_TTL_MS = 5000;
let lastHealthAt = 0;
let lastHealthy = false;
let inflightHealthCheck: Promise<boolean> | null = null;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Redis health check timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

/**
 * Best-effort Redis health check. Never hangs longer than `timeoutMs`.
 * Cached briefly to avoid hammering when Redis is down.
 */
export const isRedisHealthy = async (options: RedisHealthOptions = {}): Promise<boolean> => {
  if (isBuildTime()) return false;

  const now = Date.now();
  const timeoutMs = options.timeoutMs ?? 500;
  if (!options.force && now - lastHealthAt < HEALTH_TTL_MS) {
    return lastHealthy;
  }

  if (inflightHealthCheck) return inflightHealthCheck;

  inflightHealthCheck = (async () => {
    try {
      const connection = getRedisConnection();
      if (!connection) return false;
      const pong = await withTimeout(connection.ping(), timeoutMs);
      // ioredis returns "PONG" when healthy.
      return typeof pong === "string" && pong.toUpperCase() === "PONG";
    } catch {
      return false;
    } finally {
      lastHealthAt = Date.now();
      inflightHealthCheck = null;
    }
  })();

  const healthy = await inflightHealthCheck;
  lastHealthy = healthy;
  return healthy;
};