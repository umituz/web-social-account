/**
 * Threads API Constants
 */

export const THREADS_API_ENDPOINTS = {
  BASE_URL: "https://graph.threads.net/v1.0",
  AUTHORIZATION_URL: "https://threads.net/oauth/authorize",
  TOKEN_URL: "https://graph.threads.net/oauth/access_token",

  // API endpoints
  USER: "/me",
  USER_THREADS: "/me/threads",
  THREADS_PUBLISH: "/threads",
  THREADS_CONTAINER: "/threads",
} as const;

export const THREADS_SCOPES = {
  BASIC: ["threads_basic"],
  POST: ["threads_basic", "threads_content_write"],
  FULL: ["threads_basic", "threads_content_write", "threads_manage_posts", "threads_manage_insights"],
} as const;

export const THREADS_MEDIA_TYPE = {
  TEXT_POST: "TEXT_POST",
  IMAGE_POST: "IMAGE_POST",
  VIDEO_POST: "VIDEO_POST",
} as const;

export const THREADS_CONTAINER_STATUS = {
  QUEUED: "QUEUED",
  PUBLISHING: "PUBLISHING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
} as const;

export const THREADS_LIMITS = {
  MAX_POST_LENGTH: 500,
  MAX_HASHTAGS: 3,
  MAX_LINKS: 5,
  MAX_MENTIONS: 5,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 100,
} as const;

export const THREADS_API_CONFIG = {
  VERSION: "v1.0",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    POSTS_PER_HOUR: 30,
  },
} as const;
