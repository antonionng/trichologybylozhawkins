import IORedis from "ioredis";
import { getServerEnv } from "@/server/schema";

let redis: IORedis.Redis | null = null;

export const getRedisConnection = () => {
  if (!redis) {
    const env = getServerEnv();
    redis = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return redis;
};

export type RedisConnection = ReturnType<typeof getRedisConnection>;

