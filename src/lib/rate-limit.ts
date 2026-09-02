import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { integrations, serverEnv } from "@/lib/env";

// =============================================================================
// Rate limiter — Upstash Redis when configured, in-memory fallback otherwise.
//
// The in-memory store resets per invocation on serverless (each request may
// hit a fresh instance), so it's suitable for local dev / single-instance
// deployments only. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// (see .env.example) to get a real distributed limiter with no code change
// at call sites — see docs/integrations.md.
// =============================================================================

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

const redisLimiter = integrations.upstash
  ? new Ratelimit({
      redis: new Redis({
        url: serverEnv.UPSTASH_REDIS_REST_URL!,
        token: serverEnv.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_MS} ms`),
      prefix: "ratelimit",
    })
  : null;

interface Entry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, Entry>();

function pruneMemoryEntry(key: string): void {
  const entry = memoryStore.get(key);
  if (entry && Date.now() > entry.resetAt) {
    memoryStore.delete(key);
  }
}

function checkMemoryRateLimit(
  identifier: string,
  limit: number,
  window: number
): boolean {
  pruneMemoryEntry(identifier);
  const entry = memoryStore.get(identifier);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + window });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Check if a request is allowed under the rate limit.
 * Returns `true` if allowed, `false` if rate limited. Uses Upstash Redis
 * when configured (see `integrations.upstash` in `@/lib/env`), otherwise
 * an in-memory limiter — note its serverless caveat above.
 *
 * @param identifier - Unique key for the client (e.g. IP address)
 * @param options - Optional overrides for limit and window. Ignored when
 *   Upstash is configured — its window is fixed at construction time.
 *
 * @example
 * ```ts
 * const ip = getClientIdentifier(req.headers);
 * if (!(await checkRateLimit(ip))) {
 *   throw new RateLimitError();
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  options?: { maxRequests?: number; windowMs?: number }
): Promise<boolean> {
  if (redisLimiter) {
    const { success } = await redisLimiter.limit(identifier);
    return success;
  }

  return checkMemoryRateLimit(
    identifier,
    options?.maxRequests ?? MAX_REQUESTS,
    options?.windowMs ?? WINDOW_MS
  );
}

/**
 * Extract client IP from request headers.
 * Prefers x-forwarded-for (first hop), then x-real-ip.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
