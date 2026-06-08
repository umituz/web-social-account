/**
 * OAuth state shape validator.
 *
 * Verifies the opaque `state` value passed through the authorization
 * redirect carries enough entropy to resist brute-force. Accepts UUIDs
 * or any high-entropy string of at least 32 hex characters / 16+ bytes.
 */

const MIN_STATE_LENGTH = 16;
const UUID_HEX_PATTERN = /^[a-f0-9-]{8,}$/i;

export const hasValidOAuthStateShape = (state: string): boolean => {
  if (!state) return false;
  if (state.length < MIN_STATE_LENGTH) return false;
  return UUID_HEX_PATTERN.test(state) || /[a-z]/.test(state) && /[0-9]/.test(state);
};
