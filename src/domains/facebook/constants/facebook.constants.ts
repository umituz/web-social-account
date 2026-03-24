/**
 * Facebook Graph API Constants
 */

export const FACEBOOK_API_ENDPOINTS = {
  BASE_URL: "https://graph.facebook.com/v18.0",
  AUTHORIZATION_URL: "https://www.facebook.com/v18.0/dialog/oauth",
  TOKEN_URL: "https://graph.facebook.com/v18.0/oauth/access_token",

  // API endpoints
  USER: "/me",
  USER_ACCOUNTS: "/me/accounts",
  PAGE_FEED: "/feed",
  PAGE_POSTS: "/posts",
} as const;

export const FACEBOOK_SCOPES = {
  BASIC: ["public_profile"],
  PAGES: ["pages_show_list", "pages_read_engagement"],
  POSTS: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
  FULL: ["public_profile", "pages_show_list", "pages_read_engagement", "pages_manage_posts"],
} as const;

export const FACEBOOK_POST_STATUS = {
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  DRAFT: "draft",
} as const;

export const FACEBOOK_LIMITS = {
  MAX_POST_LENGTH: 63206,
  MAX_IMAGE_SIZE_MB: 4,
  MAX_VIDEO_SIZE_MB: 1024,
  MAX_HASHTAGS: 5,
} as const;

export const FACEBOOK_API_CONFIG = {
  VERSION: "v18.0",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    POSTS_PER_DAY: 100,
  },
} as const;
