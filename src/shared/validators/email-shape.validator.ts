
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hasValidEmailShape = (email: string): boolean => EMAIL_PATTERN.test(email);
