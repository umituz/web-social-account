/**
 * Cache entry expiry timestamp.
 *
 * Computes the absolute `expiresAt` (ms) for a cache entry given a
 * TTL relative to now.
 */

export const calculateCacheExpiresAt = (ttlMs: number, now: number = Date.now()): number =>
  now + ttlMs;
