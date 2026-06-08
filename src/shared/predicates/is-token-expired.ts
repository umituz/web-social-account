/**
 * Whether an access token's absolute expiry has already passed.
 *
 * Returns `false` when the token has no known expiry (non-expiring tokens,
 * e.g. some Telegram bot tokens, or unconfigured long-lived tokens).
 */

export const isTokenExpired = (expiresAt: number | null | undefined, now: number = Date.now()): boolean => {
  if (expiresAt === null || expiresAt === undefined) return false;
  return now >= expiresAt;
};
