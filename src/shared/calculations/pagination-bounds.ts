/**
 * Pagination bound clamping.
 *
 * Centralizes the "clamp a user-supplied count into a safe range" math
 * used by every API service that supports pagination.
 */

export interface ClampParams {
  requested: number;
  defaultValue: number;
  min: number;
  max: number;
}

/**
 * Returns `requested` clamped to `[min, max]`. Falls back to `defaultValue`
 * when `requested` is not a positive number.
 */
export const clampRequestedCount = ({
  requested,
  defaultValue,
  min,
  max,
}: ClampParams): number => {
  if (!Number.isFinite(requested) || requested <= 0) return defaultValue;
  return Math.min(Math.max(requested, min), max);
};
