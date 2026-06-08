/**
 * Medium API Constants
 */

export const MEDIUM_API_ENDPOINTS = {
  BASE_URL: "https://api.medium.com/v1",
  AUTHORIZATION_URL: "https://medium.com/m/oauth/authorize",
  TOKEN_URL: "https://medium.com/v1/tokens",
  ME: "/me",
  USER_PUBLICATIONS: (userId: string) => `/users/${userId}/publications`,
  USER_POSTS: (userId: string) => `/users/${userId}/posts`,
  PUBLICATION_POSTS: (publicationId: string) => `/publications/${publicationId}/posts`,
} as const;

export const MEDIUM_SCOPES = {
  BASIC_PROFILE: "basicProfile",
  PUBLISH_POST: "publishPost",
  LIST_PUBLICATIONS: "listPublications",
} as const;

export const MEDIUM_PUBLISH_STATUS = {
  DRAFT: "draft",
  PUBLIC: "public",
  UNLISTED: "unlisted",
} as const;

export const MEDIUM_CONTENT_FORMAT = {
  HTML: "html",
  MARKDOWN: "markdown",
} as const;

export const MEDIUM_API_CONFIG = {
  VERSION: "v1",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;
