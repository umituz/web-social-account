/**
 * Whether an OAuth state has outlived its allowed TTL.
 *
 * Used to prevent replay attacks and stale CSRF tokens from being
 * accepted during the code-for-token exchange.
 */

import { isOlderThanMs } from "../time/timestamp";

export const isStateExpired = (stateTimestamp: number, maxAgeMs: number): boolean =>
  isOlderThanMs(stateTimestamp, maxAgeMs);
