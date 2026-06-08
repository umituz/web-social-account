/**
 * Whether the HTTP client should retry a request based on the response status.
 *
 * Rules:
 * - 4xx (except 429) → caller error, no retry.
 * - 429 → transient, retry with backoff.
 * - 5xx → transient, retry with backoff.
 * - Network errors (no status) → retry.
 */

export const shouldRetryOnStatus = (status: number): boolean => {
  if (status >= 500) return true;
  if (status === 429) return true;
  return false;
};

export const isClientError = (status: number): boolean =>
  status >= 400 && status < 500 && status !== 429;

export const isServerError = (status: number): boolean => status >= 500;
