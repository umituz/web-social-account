/**
 * Discord API Service (Bot-based)
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { DiscordUser, DiscordGuild, DiscordChannel, DiscordMessage, DiscordError } from "../types/discord.types";

export class DiscordApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://discord.com/api/v10";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<DiscordUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch user profile: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as DiscordUser;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get user's guilds
   */
  async getUserGuilds(accessToken: string): Promise<SocialApiResponse<DiscordGuild[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch guilds: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as DiscordGuild[];

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get guild channels
   */
  async getGuildChannels(
    botToken: string,
    guildId: string
  ): Promise<SocialApiResponse<DiscordChannel[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/guilds/${guildId}/channels`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch channels: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as DiscordChannel[];

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Create a message (bot-based)
   */
  async createMessage(
    botToken: string,
    channelId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: Record<string, unknown> = {
        content: content.text,
      };

      if (content.media && content.media.length > 0) {
        body.embeds = [
          {
            image: {
              url: content.media[0].url,
            },
          },
        ];
      }

      const response = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as DiscordError;
        return {
          success: false,
          error: {
            code: error?.code?.toString() || response.status.toString(),
            message: error?.message || "Failed to create message",
            details: error,
          },
        };
      }

      const data = (await response.json()) as DiscordMessage;

      return {
        success: true,
        data: { id: data.id },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get channel messages
   */
  async getChannelMessages(
    botToken: string,
    channelId: string,
    limit: number = 50
  ): Promise<SocialApiResponse<DiscordMessage[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels/${channelId}/messages?limit=${limit}`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch messages: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as DiscordMessage[];

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }
}
