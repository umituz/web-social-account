/**
 * TikTok API Constants
 */

export const TIKTOK_API_ENDPOINTS = {
  BASE_URL: "https://open.tiktokapis.com/v2",
  AUTHORIZATION_URL: "https://open.tiktokapis.com/v2/oauth/authorize",
  TOKEN_URL: "https://open.tiktokapis.com/v2/oauth/token",

  // API endpoints
  USER_INFO: "/user/info/",
  VIDEO_LIST: "/video/list/",
  VIDEO_UPLOAD: "/video/publish/",
  VIDEO_INIT: "/video/publish/initialize/",
} as const;

export const TIKTOK_SCOPES = {
  BASIC: ["user.info.basic"],
  VIDEO: ["user.info.basic", "video.list"],
  PUBLISH: ["user.info.basic", "video.list", "video.publish"],
} as const;

export const TIKTOK_VIDEO_STATUS = {
  UPLOADING: "UPLOADING",
  PUBLISH_COMPLETE: "PUBLISH_COMPLETE",
  FAILED: "FAILED",
  DELETED: "DELETED",
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
} as const;

export const TIKTOK_LIMITS = {
  MAX_VIDEO_TITLE_LENGTH: 150,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_HASHTAGS: 5,
  MAX_VIDEO_SIZE_MB: 500,
  MAX_VIDEO_DURATION_SECONDS: 600,
} as const;

export const TIKTOK_API_CONFIG = {
  VERSION: "v2",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    POSTS_PER_DAY: 30,
  },
} as const;
