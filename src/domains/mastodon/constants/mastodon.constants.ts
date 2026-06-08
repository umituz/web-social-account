/**
 * Mastodon API Constants
 *
 * Mastodon is federated: each instance has its own endpoints. The base
 * endpoints below are RELATIVE paths; the instance URL is prepended at
 * runtime by MastodonOAuthService / MastodonApiService.
 */

export const MASTODON_API_ENDPOINTS = {
  AUTHORIZATION_PATH: "/oauth/authorize",
  TOKEN_PATH: "/oauth/token",
  REVOKE_PATH: "/oauth/revoke",
  VERIFY_CREDENTIALS: "/api/v1/accounts/verify_credentials",
  USER_STATUSES: "/api/v1/accounts/verify_credentials/statuses",
  STATUSES: "/api/v1/statuses",
  STATUS: (id: string) => `/api/v1/statuses/${id}`,
  MEDIA: "/api/v2/media",
} as const;

export const MASTODON_DEFAULT_INSTANCE = "https://mastodon.social";

export const MASTODON_SCOPES = {
  READ: "read",
  WRITE: "write",
  FOLLOW: "follow",
  PUSH: "push",
  ADMIN_READ: "admin:read",
  ADMIN_WRITE: "admin:write",
} as const;

export const MASTODON_VISIBILITY = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  PRIVATE: "private",
  DIRECT: "direct",
} as const;

export const MASTODON_API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;
