
export const calculateCacheExpiresAt = (ttlMs: number, now: number = Date.now()): number =>
  now + ttlMs;
