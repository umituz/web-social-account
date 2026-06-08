/**
 * Discord API Constants
 */

export const DISCORD_API_ENDPOINTS = {
  BASE_URL: "https://discord.com/api/v10",
  AUTHORIZATION_URL: "https://discord.com/oauth2/authorize",
  TOKEN_URL: "https://discord.com/api/oauth2/token",
  REVOKE_URL: "https://discord.com/api/oauth2/token/revoke",
  USER: "/users/@me",
  USER_GUILDS: "/users/@me/guilds",
  GUILD_CHANNELS: (guildId: string) => `/guilds/${guildId}/channels`,
  CHANNEL_MESSAGES: (channelId: string) => `/channels/${channelId}/messages`,
} as const;

export const DISCORD_SCOPES = {
  IDENTIFY: "identify",
  EMAIL: "email",
  GUILDS: "guilds",
  BOT: "bot",
  MESSAGES_READ: "messages.read",
  MESSAGES_WRITE: "messages.write",
} as const;

export const DISCORD_API_CONFIG = {
  VERSION: "v10",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;
