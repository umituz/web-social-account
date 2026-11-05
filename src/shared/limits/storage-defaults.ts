
import { minutesToMs } from "../time/duration";

export const STORAGE_DEFAULTS = {
  CACHE_TTL_MS: minutesToMs(5),
  MAX_CACHE_ENTRIES: 50,
  CACHE_EVICTION_RATIO: 0.2,
  OAUTH_STATE_TTL_MS: minutesToMs(10),
} as const;

export type StorageDefaults = typeof STORAGE_DEFAULTS;
