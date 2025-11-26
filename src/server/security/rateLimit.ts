const bucket = new Map<
  string,
  {
    expiresAt: number;
    count: number;
  }
>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = bucket.get(key);

  if (!entry || entry.expiresAt < now) {
    bucket.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  bucket.set(key, entry);
  return true;
}

