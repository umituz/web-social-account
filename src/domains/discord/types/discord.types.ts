/**
 * Discord-specific types
 */

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id: string;
  position: number;
  permission_overwrites: unknown[];
  nsfw: boolean;
  parent_id: string | null;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  content: string;
  author: DiscordUser;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[];
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    proxy_url: string;
    size: number;
    content_type: string;
  }>;
  embeds: unknown[];
}

export interface DiscordError {
  code: number;
  message: string;
}
export interface discordError {
  error: string | { message: string; code?: number };
}
