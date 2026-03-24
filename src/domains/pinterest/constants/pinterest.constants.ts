/**
 * Pinterest API Constants
 */

export const PINTEREST_API_ENDPOINTS = {
  BASE_URL: "https://api.pinterest.com/v5",
  AUTHORIZATION_URL: "https://www.pinterest.com/oauth/",
  TOKEN_URL: "https://api.pinterest.com/v5/oauth/token",

  // API endpoints
  USER: "/me",
  USER_BOARDS: "/me/boards",
  BOARD_PINS: "/boards",
  PINS: "/pins",
} as const;

export const PINTEREST_SCOPES = {
  BASIC: ["read_public"],
  WRITE: ["read_public", "write_public"],
  FULL: ["read_public", "write_public"],
} as const;

export const PINTEREST_PIN_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PROTECTED: "PROTECTED",
  SECRET: "SECRET",
} as const;

export const PINTEREST_LIMITS = {
  MAX_PIN_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 500,
} as const;

export const PINTEREST_API_CONFIG = {
  VERSION: "v5",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    PINS_PER_DAY: 100,
  },
} as const;
