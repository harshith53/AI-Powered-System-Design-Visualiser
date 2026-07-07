import type { ArchitectureBlueprint } from "@/types/architecture";
import { createHash } from "crypto";

interface CacheEntry {
  blueprint: ArchitectureBlueprint;
  expiresAt: number;
  createdAt: number;
}

const MAX_ENTRIES = 100;
const TTL_MS = 60 * 60 * 1000; // 1 hour

// Module-level cache — persists across requests in the same process
const store = new Map<string, CacheEntry>();
let isEvicting = false; // Prevent concurrent eviction

function evictExpired() {
  const now = Date.now();
  const expired: string[] = [];
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) expired.push(key);
  }
  for (const key of expired) store.delete(key);
}

function evictLRU() {
  if (store.size === 0) return;
  // Find entry with oldest createdAt time
  let oldest: [string, CacheEntry] | null = null;
  for (const [key, entry] of store) {
    if (!oldest || entry.createdAt < oldest[1].createdAt) {
      oldest = [key, entry];
    }
  }
  if (oldest) store.delete(oldest[0]);
}

export function cacheKey(problem: string): string {
  const normalized = problem.toLowerCase().replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function getCached(key: string): ArchitectureBlueprint | null {
  evictExpired();
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.blueprint;
}

export function setCached(key: string, blueprint: ArchitectureBlueprint): void {
  evictExpired();
  
  // Prevent concurrent eviction with simple flag (sufficient for single-threaded Node.js)
  if (isEvicting) return;
  
  if (store.size >= MAX_ENTRIES) {
    isEvicting = true;
    evictLRU();
    isEvicting = false;
  }
  
  store.set(key, { 
    blueprint, 
    expiresAt: Date.now() + TTL_MS,
    createdAt: Date.now(),
  });
}

export function getCacheStats(): { size: number; maxSize: number } {
  evictExpired();
  return { size: store.size, maxSize: MAX_ENTRIES };
}
