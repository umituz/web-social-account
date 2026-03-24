/**
 * LinkedIn API Constants
 */

/**
 * LinkedIn API endpoints
 */
export const LINKEDIN_API_ENDPOINTS = {
  BASE_URL: "https://api.linkedin.com/v2",
  AUTHORIZATION_URL: "https://www.linkedin.com/oauth/v2/authorization",
  TOKEN_URL: "https://www.linkedin.com/oauth/v2/accessToken",

  // People endpoints
  PROFILE: "/me",

  // UGC posts endpoints
  POSTS: "/ugcPosts",
} as const;

/**
 * Share content keys - must match LinkedIn API exactly
 */
export const LINKEDIN_SHARE_CONTENT = "com.linkedin.ugc.ShareContent" as const;
export const LINKEDIN_MEMBER_NETWORK_VISIBILITY = "com.linkedin.ugc.MemberNetworkVisibility" as const;

/**
 * LinkedIn OAuth scopes
 */
export const LINKEDIN_SCOPES = {
  BASIC: ["openid", "profile", "email"],
  SOCIAL: ["w_member_social"],
  FULL: ["openid", "profile", "email", "w_member_social"],
} as const;

/**
 * LinkedIn member network visibility values
 */
export const LINKEDIN_VISIBILITY = {
  PUBLIC: "PUBLIC",
  CONNECTIONS: "CONNECTIONS",
  LOGGED_IN: "LOGGED_IN",
} as const;

/**
 * LinkedIn share media categories
 */
export const LINKEDIN_MEDIA_CATEGORY = {
  NONE: "NONE",
  ARTICLE: "ARTICLE",
  IMAGE: "IMAGE",
} as const;

/**
 * LinkedIn post lifecycle states
 */
export const LINKEDIN_POST_STATUS = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
} as const;

/**
 * LinkedIn API configuration
 */
export const LINKEDIN_API_CONFIG = {
  VERSION: "v2",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    REQUESTS_PER_DAY: 500,
  },
} as const;

// Type exports for TypeScript
export type LinkedInVisibility = typeof LINKEDIN_VISIBILITY[keyof typeof LINKEDIN_VISIBILITY];
export type LinkedInMediaCategory = typeof LINKEDIN_MEDIA_CATEGORY[keyof typeof LINKEDIN_MEDIA_CATEGORY];
export type LinkedInPostStatus = typeof LINKEDIN_POST_STATUS[keyof typeof LINKEDIN_POST_STATUS];
