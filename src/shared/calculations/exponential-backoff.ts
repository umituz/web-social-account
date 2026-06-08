/**
 * Exponential backoff with a hard cap.
 *
 * Used for HTTP retry delays. The delay doubles on every attempt but
 * never exceeds `maxDelayMs`.
 */

export interface BackoffParams {
  attempt: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const calculateRetryDelay = ({
  attempt,
  baseDelayMs,
  maxDelayMs,
}: BackoffParams): number => {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  return Math.min(exponential, maxDelayMs);
};
