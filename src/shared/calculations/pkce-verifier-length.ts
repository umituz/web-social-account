/**
 * PKCE code-verifier length.
 *
 * RFC 7636 mandates a verifier length between 43 and 128 octets.
 * Most implementations settle on 64 for a good entropy / URL size trade-off.
 */

export const PKCE_VERIFIER_MIN_LENGTH = 43;
export const PKCE_VERIFIER_MAX_LENGTH = 128;
export const PKCE_VERIFIER_DEFAULT_LENGTH = 64;
