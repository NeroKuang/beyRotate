import { redisGetJson, redisSetJson, getRedis } from "@/lib/redis";

const PREFIX = "catalog:v9";

export function catalogCacheKey(
  kind: "search" | "search-unified" | "groups" | "codes" | "parts",
  categoryOrType: string,
  q: string,
  series = "all"
): string {
  return `${PREFIX}:${kind}:${categoryOrType}:${series}:${q.toLowerCase().trim() || "_"}`;
}

export async function getCached<T>(key: string): Promise<T | null> {
  return redisGetJson<T>(key);
}

export async function setCached<T>(
  key: string,
  data: T,
  ttlSeconds = 600
): Promise<void> {
  await redisSetJson(key, data, ttlSeconds);
}

export async function invalidateCatalogCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    if (redis.status !== "ready") await redis.connect();
    const keys = await redis.keys(`${PREFIX}:*`);
    if (keys.length) await redis.del(...keys);
  } catch {
    /* ignore */
  }
}
