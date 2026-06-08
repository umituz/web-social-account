/**
 * Timestamp helpers.
 *
 * All time math is centralized here so callers never compare `Date.now()`
 * literals directly.
 */

import { secondsToMs } from "./duration";

export const nowMs = (): number => Date.now();

/**
 * Age in milliseconds between `timestamp` (ms) and now.
 * Returns 0 when `timestamp` is in the future.
 */
export const ageInMs = (timestamp: number): number => {
  const diff = Date.now() - timestamp;
  return diff < 0 ? 0 : diff;
};

/**
 * Whether `timestamp` is older than `maxAgeMs` relative to now.
 */
export const isOlderThanMs = (timestamp: number, maxAgeMs: number): boolean =>
  ageInMs(timestamp) > maxAgeMs;

/**
 * Build an absolute expiry timestamp from a `seconds-until-expiry` value
 * returned by OAuth providers.
 */
export const expiryFromNow = (secondsUntilExpiry: number | undefined): number | null =>
  secondsUntilExpiry === undefined ? null : Date.now() + secondsToMs(secondsUntilExpiry);
