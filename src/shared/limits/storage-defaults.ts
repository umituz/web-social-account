/**
 * Storage-layer defaults for in-memory cache entries.
 */

import { minutesToMs } from "../time/duration";

export const STORAGE_DEFAULTS = {
  /** Cache TTL for session/local storage adapter entries. */
  CACHE_TTL_MS: minutesToMs(5),
  /** Hard cap on cached entries per prefix. */
  MAX_CACHE_ENTRIES: 50,
  /** Fraction of cache evicted when MAX_CACHE_ENTRIES is reached. */
  CACHE_EVICTION_RATIO: 0.2,
  /** Maximum age (ms) of a persisted OAuth state before it is purged. */
  OAUTH_STATE_TTL_MS: minutesToMs(10),
} as const;

export type StorageDefaults = typeof STORAGE_DEFAULTS;
