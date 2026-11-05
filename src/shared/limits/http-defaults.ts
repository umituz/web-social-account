
import { minutesToMs, secondsToMs } from "../time/duration";

export const HTTP_DEFAULTS = {
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  LONG_RUNNING_TIMEOUT_MS: secondsToMs(120),
  CACHE_TTL_MS: minutesToMs(5),
  MAX_CACHE_ENTRIES: 100,
  CACHE_EVICTION_RATIO: 0.2,
  RETRY_MAX_DELAY_MS: secondsToMs(10),
  RETRY_BASE_DELAY_MS: secondsToMs(1),
} as const;

export type HttpDefaults = typeof HTTP_DEFAULTS;
