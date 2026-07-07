// In-memory token bucket rate limiter — per IP + global
// Phase 5: swap this module for @upstash/ratelimit with same interface

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const PER_IP_LIMIT = 10;     // requests per window
const GLOBAL_LIMIT = 100;    // requests per window
const WINDOW_MS = 60_000;    // 1 minute

const ipBuckets = new Map<string, Bucket>();
let globalBucket: Bucket = { tokens: GLOBAL_LIMIT, lastRefill: Date.now() };

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

export function checkRateLimit(ip: string): RateLimitResult {
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

// Clean up stale IP buckets every 5 minutes to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 2;
  for (const [ip, bucket] of ipBuckets) {
    if (bucket.lastRefill < cutoff) ipBuckets.delete(ip);
  }
}, 5 * 60_000);
