
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
