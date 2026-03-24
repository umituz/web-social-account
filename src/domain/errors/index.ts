/**
 * Custom error classes for social media account management
 */

export class SocialAccountError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "SocialAccountError";
  }
}

export class OAuthError extends SocialAccountError {
  constructor(
    platform: string,
    message: string,
    details?: unknown
  ) {
    super(message, "OAUTH_ERROR", platform, details);
    this.name = "OAuthError";
  }
}

export class TokenRefreshError extends SocialAccountError {
  constructor(
    platform: string,
    message: string,
    details?: unknown
  ) {
    super(message, "TOKEN_REFRESH_ERROR", platform, details);
    this.name = "TokenRefreshError";
  }
}

export class InvalidTokenError extends SocialAccountError {
  constructor(
    platform: string,
    details?: unknown
  ) {
    super("Invalid or expired access token", "INVALID_TOKEN", platform, details);
    this.name = "InvalidTokenError";
  }
}

export class ConfigurationError extends SocialAccountError {
  constructor(
    platform: string,
    message: string,
    details?: unknown
  ) {
    super(message, "CONFIGURATION_ERROR", platform, details);
    this.name = "ConfigurationError";
  }
}

export class NetworkError extends SocialAccountError {
  constructor(
    platform: string,
    message: string,
    details?: unknown
  ) {
    super(message, "NETWORK_ERROR", platform, details);
    this.name = "NetworkError";
  }
}

export class RateLimitError extends SocialAccountError {
  constructor(
    platform: string,
    public retryAfter: number,
    details?: unknown
  ) {
    super("Rate limit exceeded", "RATE_LIMIT_ERROR", platform, details);
    this.name = "RateLimitError";
  }
}

export class AccountNotFoundError extends SocialAccountError {
  constructor(
    platform: string,
    accountId: string
  ) {
    super(
      `Account ${accountId} not found`,
      "ACCOUNT_NOT_FOUND",
      platform
    );
    this.name = "AccountNotFoundError";
  }
}

export class UnsupportedOperationError extends SocialAccountError {
  constructor(
    platform: string,
    operation: string
  ) {
    super(
      `Operation '${operation}' is not supported for ${platform}`,
      "UNSUPPORTED_OPERATION",
      platform
    );
    this.name = "UnsupportedOperationError";
  }
}
