/**
 * Pinterest platform limits
 */

import { secondsToMs } from "../time/duration";

export const PINTEREST_LIMITS = {
  MAX_PIN_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 500,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type PinterestLimits = typeof PINTEREST_LIMITS;
