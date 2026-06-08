/**
 * Cache eviction count calculator.
 *
 * When a bounded cache exceeds its maximum size, the oldest entries are
 * dropped to make room. This module computes how many entries to evict
 * given a cache size and a target ratio (default 20%).
 */

export interface EvictionCountParams {
  currentSize: number;
  maxSize: number;
  /** Fraction of `maxSize` to evict (0 < ratio < 1). Default 0.2. */
  evictionRatio?: number;
}

export const calculateEvictionCount = ({
  currentSize,
  maxSize,
  evictionRatio = 0.2,
}: EvictionCountParams): number => {
  if (currentSize <= maxSize) return 0;
  return Math.ceil(maxSize * evictionRatio);
};
