/**
 * Telegram platform limits
 */

import { secondsToMs } from "../time/duration";

export const TELEGRAM_LIMITS = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_CAPTION_LENGTH: 1024,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  DEFAULT_UPDATE_LIMIT: 100,
} as const;

export type TelegramLimits = typeof TELEGRAM_LIMITS;
