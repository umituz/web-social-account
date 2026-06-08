/**
 * Threads platform limits
 */

import { secondsToMs } from "../time/duration";

export const THREADS_LIMITS = {
  MAX_TEXT_LENGTH: 500,
  MAX_MEDIA_PER_POST: 10,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  NON_EXPIRING_TOKEN_VALIDITY_DAYS: 60,
} as const;

export type ThreadsLimits = typeof THREADS_LIMITS;
