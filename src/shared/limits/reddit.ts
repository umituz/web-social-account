/**
 * Reddit platform limits
 */

import { secondsToMs } from "../time/duration";

export const REDDIT_LIMITS = {
  MAX_POST_TITLE_LENGTH: 300,
  MAX_BODY_LENGTH: 40000,
  MAX_MEDIA_PER_POST: 1,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type RedditLimits = typeof REDDIT_LIMITS;
