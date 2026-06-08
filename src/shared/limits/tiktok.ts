/**
 * TikTok platform limits
 */

import { secondsToMs } from "../time/duration";

export const TIKTOK_LIMITS = {
  MAX_VIDEO_DESCRIPTION_LENGTH: 2200,
  MAX_HASHTAGS: 5,
  MAX_VIDEO_DURATION_SECONDS: 600,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type TikTokLimits = typeof TIKTOK_LIMITS;
