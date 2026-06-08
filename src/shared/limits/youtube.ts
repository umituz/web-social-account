/**
 * YouTube platform limits
 */

import { secondsToMs } from "../time/duration";

export const YOUTUBE_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TAGS: 500,
  DEFAULT_CATEGORY_ID: "22",
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  DAILY_API_QUOTA_UNITS: 10000,
} as const;

export type YouTubeLimits = typeof YOUTUBE_LIMITS;
