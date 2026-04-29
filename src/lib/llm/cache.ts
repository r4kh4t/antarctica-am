import { createHash } from "node:crypto";

/**
 * In-process rationale response cache.
 *
 * Uses a module-level Map so cache entries persist across requests within the
 * same server process. This works well in development and single-instance
 * deployments. For multi-instance production (e.g. Vercel with many concurrent
 * function instances), upgrade to a distributed cache such as Vercel KV / Upstash
 * Redis — the interface here (get/set/buildKey) stays the same, only the storage
 * backend changes.
 */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Builds a deterministic SHA-256 cache key from any JSON-serialisable payload.
 * Object keys are sorted before serialisation so key order does not affect the hash.
 */
export function buildRationaleCacheKey(payload: unknown): string {
  const sorted = sortedStringify(payload);
  return createHash("sha256").update(sorted).digest("hex");
}

function sortedStringify(value: unknown): string {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  const sorted = Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, JSON.parse(sortedStringify(v))]),
  );
  return JSON.stringify(sorted);
}

export function getCachedRationale<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedRationale<T>(key: string, value: T): void {
  store.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Exposed for tests only — clears all cache entries. */
export function clearRationaleCache(): void {
  store.clear();
}
