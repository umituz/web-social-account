/**
 * LinkedIn platform limits
 */

import { secondsToMs } from "../time/duration";

export const LINKEDIN_LIMITS = {
  MAX_POST_LENGTH: 3000,
  MAX_COMMENT_LENGTH: 1250,
  MAX_HASHTAGS: 3,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  RATE_LIMIT_REQUESTS_PER_DAY: 500,
} as const;

export type LinkedInLimits = typeof LINKEDIN_LIMITS;
