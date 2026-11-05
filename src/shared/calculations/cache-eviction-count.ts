
export interface EvictionCountParams {
  currentSize: number;
  maxSize: number;
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
