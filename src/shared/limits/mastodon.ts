/**
 * Mastodon platform limits
 */

import { secondsToMs } from "../time/duration";

export const MASTODON_LIMITS = {
  MAX_POST_LENGTH: 500,
  MAX_MEDIA_PER_POST: 4,
  MAX_DESCRIPTION_LENGTH: 420,
  TIMEOUT_MS: secondsToMs(30),
  MAX_RETRIES: 3,
  DEFAULT_INSTANCE_URL: "https://mastodon.social",
} as const;

export type MastodonLimits = typeof MASTODON_LIMITS;
