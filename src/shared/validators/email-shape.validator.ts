/**
 * Email shape validator.
 *
 * Lightweight syntactic check (RFC 5321 allows much more). Sufficient
 * for catching obvious typos before storage / transmission. For full
 * RFC compliance use a dedicated library.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hasValidEmailShape = (email: string): boolean => EMAIL_PATTERN.test(email);
