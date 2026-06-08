/**
 * HTTP-layer defaults used across the package
 */

import { minutesToMs, secondsToMs } from "../time/duration";

export const HTTP_DEFAULTS = {
  /** Default per-request timeout. */
  TIMEOUT_MS: secondsToMs(30),
  /** Default retry attempts before failing. */
  MAX_RETRIES: 3,
  /** Long-running request timeout (e.g. video upload). */
  LONG_RUNNING_TIMEOUT_MS: secondsToMs(120),
  /** Cache time-to-live for GET responses. */
  CACHE_TTL_MS: minutesToMs(5),
  /** Hard upper bound for the in-memory HTTP cache. */
  MAX_CACHE_ENTRIES: 100,
  /** Fraction of cache evicted once `MAX_CACHE_ENTRIES` is reached. */
  CACHE_EVICTION_RATIO: 0.2,
  /** Upper bound for exponential-backoff retry delay. */
  RETRY_MAX_DELAY_MS: secondsToMs(10),
  /** First retry delay; doubles each attempt up to the cap. */
  RETRY_BASE_DELAY_MS: secondsToMs(1),
} as const;

export type HttpDefaults = typeof HTTP_DEFAULTS;
