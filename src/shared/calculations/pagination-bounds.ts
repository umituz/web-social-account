
export interface ClampParams {
  requested: number;
  defaultValue: number;
  min: number;
  max: number;
}

export const clampRequestedCount = ({
  requested,
  defaultValue,
  min,
  max,
}: ClampParams): number => {
  if (!Number.isFinite(requested) || requested <= 0) return defaultValue;
  return Math.min(Math.max(requested, min), max);
};
