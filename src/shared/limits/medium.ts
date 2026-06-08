/**
 * Medium platform limits
 */

import { secondsToMs } from "../time/duration";

export const MEDIUM_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_TAGS: 5,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
} as const;

export type MediumLimits = typeof MEDIUM_LIMITS;
