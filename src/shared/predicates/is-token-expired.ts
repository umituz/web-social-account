
export const isTokenExpired = (expiresAt: number | null | undefined, now: number = Date.now()): boolean => {
  if (expiresAt === null || expiresAt === undefined) return false;
  return now >= expiresAt;
};
