/**
 * YouTube API Constants
 */

export const YOUTUBE_API_ENDPOINTS = {
  BASE_URL: "https://www.googleapis.com/youtube/v3",
  AUTHORIZATION_URL: "https://accounts.google.com/o/oauth2/v2/auth",
  TOKEN_URL: "https://oauth2.googleapis.com/token",

  // API endpoints
  CHANNELS: "/channels",
  VIDEOS: "/videos",
  VIDEO_INSERT: "/videos/upload",
  VIDEO_STATUS: "/videos",
} as const;

export const YOUTUBE_SCOPES = {
  BASIC: ["https://www.googleapis.com/auth/youtube.readonly"],
  UPLOAD: ["https://www.googleapis.com/auth/youtube.upload"],
  FULL: ["https://www.googleapis.com/auth/youtube.upload"],
} as const;

export const YOUTUBE_PRIVACY_STATUS = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  PRIVATE: "private",
} as const;

export const YOUTUBE_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TAGS: 500,
  MAX_VIDEO_SIZE_MB: 256,
  MAX_VIDEO_DURATION_SECONDS: 43200, // 12 hours
} as const;

export const YOUTUBE_API_CONFIG = {
  VERSION: "v3",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    UNITS_PER_DAY: 10000,
  },
} as const;
