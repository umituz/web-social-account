
export const INSTAGRAM_API_ENDPOINTS = {
  BASE_URL: "https://graph.instagram.com",
  AUTHORIZATION_URL: "https://api.instagram.com/oauth/authorize",
  TOKEN_URL: "https://api.instagram.com/oauth/access_token",

  USER: "/me",
  USER_MEDIA: "/me/media",
  MEDIA_PUBLISH: "/me/media",
  CONTAINER: "/me/containers",
} as const;

export const INSTAGRAM_SCOPES = {
  BASIC: ["user_profile"],
  CONTENT: ["user_profile", "user_media"],
  FULL: ["user_profile", "user_media", "instagram_basic", "instagram_content_publish"],
} as const;

export const INSTAGRAM_MEDIA_TYPE = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  CAROUSEL_ALBUM: "CAROUSEL_ALBUM",
} as const;

export const INSTAGRAM_CONTAINER_STATUS = {
  FINISHED: "FINISHED",
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  EXPIRED: "EXPIRED",
} as const;

export const INSTAGRAM_LIMITS = {
  MAX_CAPTION_LENGTH: 2200,
  MAX_HASHTAGS: 30,
  MAX_MENTION: 5,
  MAX_IMAGE_SIZE_MB: 8,
  MAX_VIDEO_SIZE_MB: 100,
  MAX_CAROUSEL_ITEMS: 10,
} as const;

export const INSTAGRAM_API_CONFIG = {
  VERSION: "v18.0",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    POSTS_PER_HOUR: 25,
  },
} as const;
