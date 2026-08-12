// In-memory token bucket rate limiter — per IP + global
// Phase 5: swap this module for @upstash/ratelimit with same interface

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const PER_IP_LIMIT = 10;     // requests per window
const GLOBAL_LIMIT = 100;    // requests per window
const WINDOW_MS = 60_000;    // 1 minute

const ipBuckets = new Map<string, Bucket>();
let globalBucket: Bucket = { tokens: GLOBAL_LIMIT, lastRefill: Date.now() };

const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstashConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(PER_IP_LIMIT, "1 m"),
      prefix: "sd:rl:ip",
      analytics: true,
    })
  : null;

const globalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(GLOBAL_LIMIT, "1 m"),
      prefix: "sd:rl:global",
      analytics: true,
    })
  : null;

function refill(bucket: Bucket, limit: number): Bucket {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= WINDOW_MS) {
    return { tokens: limit, lastRefill: now };
  }
  return bucket;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

function checkRateLimitLocal(ip: string): RateLimitResult {
  // Global check
  globalBucket = refill(globalBucket, GLOBAL_LIMIT);
  if (globalBucket.tokens <= 0) {
    const retryAfterMs = WINDOW_MS - (Date.now() - globalBucket.lastRefill);
    return { allowed: false, retryAfterMs };
  }

  // Per-IP check
  const existing = ipBuckets.get(ip) ?? { tokens: PER_IP_LIMIT, lastRefill: Date.now() };
  const ipBucket = refill(existing, PER_IP_LIMIT);
  if (ipBucket.tokens <= 0) {
    ipBuckets.set(ip, ipBucket);
    const retryAfterMs = WINDOW_MS - (Date.now() - ipBucket.lastRefill);
    return { allowed: false, retryAfterMs };
  }

  // Consume tokens
  globalBucket.tokens -= 1;
  ipBuckets.set(ip, { ...ipBucket, tokens: ipBucket.tokens - 1 });

  return { allowed: true, retryAfterMs: 0 };
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!ipLimiter || !globalLimiter) {
    return checkRateLimitLocal(ip);
  }

  try {
    const [globalResult, ipResult] = await Promise.all([
      globalLimiter.limit("global"),
      ipLimiter.limit(ip || "unknown"),
    ]);

    if (!globalResult.success) {
      return {
        allowed: false,
        retryAfterMs: Math.max(0, globalResult.reset - Date.now()),
      };
    }

    if (!ipResult.success) {
      return {
        allowed: false,
        retryAfterMs: Math.max(0, ipResult.reset - Date.now()),
      };
    }

    return { allowed: true, retryAfterMs: 0 };
  } catch {
    return checkRateLimitLocal(ip);
  }
}

// Clean up stale IP buckets every 5 minutes to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 2;
  for (const [ip, bucket] of ipBuckets) {
    if (bucket.lastRefill < cutoff) ipBuckets.delete(ip);
  }
}, 5 * 60_000);
