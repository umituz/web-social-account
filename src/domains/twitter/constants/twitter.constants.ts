/**
 * Twitter/X API Constants
 */

/**
 * Twitter API endpoints
 */
export const TWITTER_API_ENDPOINTS = {
  BASE_URL: "https://api.twitter.com/2",
  AUTH_BASE_URL: "https://twitter.com/i/oauth2",

  // OAuth endpoints
  AUTHORIZATION_URL: "https://twitter.com/i/oauth2/authorize",
  TOKEN_URL: "https://api.twitter.com/2/oauth2/token",
  REVOKE_URL: "https://api.twitter.com/2/oauth2/revoke",

  // API endpoints
  TWEETS: "/tweets",
  USER: "/users/me",
  USER_TIMELINE: "/users/me/tweets",
  MEDIA_UPLOAD: "https://upload.twitter.com/1.1/media/upload",
} as const;

/**
 * Twitter OAuth scopes
 */
export const TWITTER_SCOPES = {
  READ: ["tweet.read", "users.read"],
  WRITE: ["tweet.write", "users.read"],
  MEDIA: ["tweet.read", "tweet.write", "users.read", "media.write"],
  FULL: ["tweet.read", "tweet.write", "users.read", "media.write", "offline.access"],
} as const;

/**
 * Twitter media types
 */
export const TWITTER_MEDIA_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  GIF: "animated_gif",
} as const;

/**
 * Twitter tweet fields
 */
export const TWITTER_TWEET_FIELDS = [
  "id",
  "text",
  "created_at",
  "public_metrics",
  "attachments",
  "entities",
] as const;

/**
 * Twitter user fields
 */
export const TWITTER_USER_FIELDS = [
  "id",
  "name",
  "username",
  "description",
  "profile_image_url",
  "public_metrics",
  "verified",
  "created_at",
] as const;

/**
 * Twitter API limits
 */
export const TWITTER_LIMITS = {
  MAX_TWEET_LENGTH: 280,
  MAX_MEDIA_PER_TWEET: 4,
  MAX_HASHTAGS: 5,
  MAX_MENTIONS: 5,
  MAX_UPLOAD_SIZE_MB: 512,
} as const;

/**
 * Twitter API configuration
 */
export const TWITTER_API_CONFIG = {
  VERSION: "2",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    TWEETS_PER_24H: 2400,
    DM_PER_24H: 1000,
  },
} as const;
