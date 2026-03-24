/**
 * Core API Constants shared across all platforms
 */

/**
 * Common HTTP methods
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

/**
 * Common OAuth response types
 */
export const OAUTH_RESPONSE_TYPES = {
  CODE: "code",
  TOKEN: "token",
} as const;

/**
 * Common OAuth grant types
 */
export const OAUTH_GRANT_TYPES = {
  AUTHORIZATION_CODE: "authorization_code",
  REFRESH_TOKEN: "refresh_token",
  CLIENT_CREDENTIALS: "client_credentials",
  PKCE: "authorization_code",
} as const;

/**
 * Common OAuth PKCE methods
 */
export const OAUTH_PKCE_METHODS = {
  PLAIN: "plain",
  S256: "S256",
} as const;

/**
 * Common account status values
 */
export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
  ERROR: "error",
} as const;

/**
 * Common media types
 */
export const MEDIA_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  GIF: "gif",
  DOCUMENT: "document",
  AUDIO: "audio",
} as const;

/**
 * Common API error codes
 */
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common HTTP status messages
 */
export const HTTP_STATUS_MESSAGES = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  429: "Rate Limit Exceeded",
  500: "Internal Server Error",
  503: "Service Unavailable",
} as const;

/**
 * Common timeout values (in milliseconds)
 */
export const TIMEOUT = {
  SECOND: 1000,
  MINUTE: 60000,
  DEFAULT: 30000,
  LONG_RUNNING: 120000,
} as const;
