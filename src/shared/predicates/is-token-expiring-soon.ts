/**
 * Whether an access token will expire within `thresholdMs`.
 *
 * Used to schedule proactive refresh before a request fails. Returns
 * `false` when the token has no known expiry.
 */

export const isTokenExpiringSoon = (
  expiresAt: number | null | undefined,
  thresholdMs: number,
  now: number = Date.now()
): boolean => {
  if (expiresAt === null || expiresAt === undefined) return false;
  return now + thresholdMs >= expiresAt;
};
