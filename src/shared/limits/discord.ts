/**
 * Discord platform limits
 */

import { secondsToMs } from "../time/duration";

export const DISCORD_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_EMBED_DESCRIPTION_LENGTH: 4096,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  MAX_BULK_MESSAGES: 100,
} as const;

export type DiscordLimits = typeof DISCORD_LIMITS;
