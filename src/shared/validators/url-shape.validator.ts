/**
 * URL shape validator.
 *
 * Uses the platform `URL` constructor to verify well-formedness.
 * Does NOT verify reachability.
 */

export const hasValidUrlShape = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
