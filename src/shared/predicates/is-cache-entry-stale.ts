/**
 * Whether a cache entry has passed its absolute expiry.
 */

export const isCacheEntryStale = (expiresAt: number, now: number = Date.now()): boolean =>
  now > expiresAt;
