/**
 * PKCE code-verifier alphabet validator.
 *
 * RFC 7636 §4.1 allows only `[A-Z][a-z][0-9]-._~`. Reject anything else
 * before submitting the verifier to a platform.
 */

const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]+$/;

export const hasValidPkceVerifierShape = (verifier: string): boolean =>
  PKCE_VERIFIER_PATTERN.test(verifier);
