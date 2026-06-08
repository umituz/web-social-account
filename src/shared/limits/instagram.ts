/**
 * Instagram platform limits
 */

import { secondsToMs } from "../time/duration";

export const INSTAGRAM_LIMITS = {
  MAX_CAPTION_LENGTH: 2200,
  MAX_HASHTAGS: 30,
  MAX_MENTIONS: 20,
  LONG_LIVED_TOKEN_VALIDITY_DAYS: 60,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type InstagramLimits = typeof INSTAGRAM_LIMITS;
