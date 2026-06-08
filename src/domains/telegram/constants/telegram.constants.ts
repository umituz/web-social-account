/**
 * Telegram API Constants
 *
 * Telegram uses a bot token in the URL rather than Bearer auth.
 * All endpoints are POST/GET against `https://api.telegram.org/bot<token>/<method>`.
 */

export const TELEGRAM_API_ENDPOINTS = {
  BASE_URL: "https://api.telegram.org",
  WIDGET_SCRIPT_URL: "https://telegram.org/js/telegram-widget.js",
  FILE_BASE: (token: string) => `/file/bot${token}`,
} as const;

export const TELEGRAM_BOT_METHODS = {
  GET_ME: "getMe",
  GET_UPDATES: "getUpdates",
  SEND_MESSAGE: "sendMessage",
  SEND_PHOTO: "sendPhoto",
  GET_FILE: "getFile",
} as const;

export const TELEGRAM_PARSE_MODE = {
  MARKDOWN: "Markdown",
  MARKDOWN_V2: "MarkdownV2",
  HTML: "HTML",
} as const;

export const TELEGRAM_API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  DEFAULT_UPDATE_LIMIT: 100,
} as const;
