/**
 * Twitter / X platform limits
 */

import { secondsToMs } from "../time/duration";

export const TWITTER_LIMITS = {
  MAX_TWEET_LENGTH: 280,
  MAX_MEDIA_PER_TWEET: 4,
  MAX_HASHTAGS: 5,
  MAX_MENTIONS: 5,
  MAX_UPLOAD_SIZE_MB: 512,
  MAX_PARALLEL_UPLOADS: 3,
  RATE_LIMIT_TWEETS_PER_DAY: 2400,
  RATE_LIMIT_DMS_PER_DAY: 1000,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type TwitterLimits = typeof TWITTER_LIMITS;
