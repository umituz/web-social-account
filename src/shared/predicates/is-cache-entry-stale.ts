
export const isCacheEntryStale = (expiresAt: number, now: number = Date.now()): boolean =>
  now > expiresAt;
