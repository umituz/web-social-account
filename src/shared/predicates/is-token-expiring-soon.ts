
export const isTokenExpiringSoon = (
  expiresAt: number | null | undefined,
  thresholdMs: number,
  now: number = Date.now()
): boolean => {
  if (expiresAt === null || expiresAt === undefined) return false;
  return now + thresholdMs >= expiresAt;
};
