
const MIN_STATE_LENGTH = 16;
const UUID_HEX_PATTERN = /^[a-f0-9-]{8,}$/i;

export const hasValidOAuthStateShape = (state: string): boolean => {
  if (!state) return false;
  if (state.length < MIN_STATE_LENGTH) return false;
  return UUID_HEX_PATTERN.test(state) || /[a-z]/.test(state) && /[0-9]/.test(state);
};
