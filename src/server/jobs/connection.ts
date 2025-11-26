import IORedis from "ioredis";
import { getServerEnv } from "@/server/schema";

let redis: IORedis | null = null;

export const getRedisConnection = () => {
  // Skip Redis connection during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null as any;
  }
  
  if (!redis) {
    const env = getServerEnv();
    redis = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }

  return redis;
};

export type RedisConnection = ReturnType<typeof getRedisConnection>;

