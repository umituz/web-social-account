/**
 * Reddit API Constants
 */

export const REDDIT_API_ENDPOINTS = {
  BASE_URL: "https://oauth.reddit.com",
  AUTHORIZATION_URL: "https://www.reddit.com/api/v1/authorize",
  TOKEN_URL: "https://www.reddit.com/api/v1/access_token",
  REVOKE_URL: "https://www.reddit.com/api/v1/revoke_token",
  ME: "/api/v1/me",
  SUBMIT: "/api/submit",
  USER_SUBMITTED: "/user/me/submitted",
  SUBREDDIT_ABOUT: (subreddit: string) => `/r/${subreddit}/about`,
} as const;

export const REDDIT_SCOPES = {
  IDENTITY: "identity",
  SUBMIT: "submit",
  READ: "read",
  SAVE: "save",
  VOTE: "vote",
  EDIT: "edit",
  HISTORY: "history",
} as const;

export const REDDIT_DURATION = {
  TEMPORARY: "temporary",
  PERMANENT: "permanent",
} as const;

export const REDDIT_KIND = {
  SELF: "self",
  LINK: "link",
  IMAGE: "image",
  VIDEO: "video",
} as const;

export const REDDIT_API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;
