
const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]+$/;

export const hasValidPkceVerifierShape = (verifier: string): boolean =>
  PKCE_VERIFIER_PATTERN.test(verifier);
