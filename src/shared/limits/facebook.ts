/**
 * Facebook platform limits
 */

import { secondsToMs } from "../time/duration";

export const FACEBOOK_LIMITS = {
  MAX_POST_LENGTH: 63206,
  MAX_COMMENT_LENGTH: 8000,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  SHORT_LIVED_TOKEN_VALIDITY_HOURS: 2,
  LONG_LIVED_TOKEN_VALIDITY_DAYS: 60,
} as const;

export type FacebookLimits = typeof FACEBOOK_LIMITS;
