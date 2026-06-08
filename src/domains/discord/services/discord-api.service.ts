/**
 * Discord API Service
 *
 * Note: Discord uses bot tokens for some operations and bearer tokens for
 * others. The base class' `authHeaders` builds Bearer headers; callers that
 * need bot auth should use `authHeadersAsBot`.
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { DiscordUser, DiscordGuild, DiscordChannel, DiscordMessage } from "../types/discord.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class DiscordApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://discord.com/api/v10";
  }

  /**
   * Build auth headers using a bot token (used for guild/channel/message ops).
   */
  private botHeaders(botToken: string): Record<string, string> {
    return { Authorization: `Bot ${botToken}` };
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<DiscordUser>> {
    return this.get<DiscordUser>("/users/@me", accessToken, { noCache: true });
  }

  async getUserGuilds(accessToken: string): Promise<SocialApiResponse<DiscordGuild[]>> {
    return this.get<DiscordGuild[]>("/users/@me/guilds", accessToken);
  }

  async getGuildChannels(
    botToken: string,
    guildId: string
  ): Promise<SocialApiResponse<DiscordChannel[]>> {
    try {
      const response = await this.http.fetch(this.url(`/guilds/${guildId}/channels`), {
        method: "GET",
        headers: this.botHeaders(botToken),
      });
      if (!response.ok) {
        return {
          success: false,
          error: { code: String(response.status), message: response.statusText },
        };
      }
      return { success: true, data: (await response.json()) as DiscordChannel[] };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  async createMessage(
    botToken: string,
    channelId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, unknown> = { content: content.text };
    if (content.media && content.media.length > 0) {
      body.embeds = [{ image: { url: content.media[0].url } }];
    }

    try {
      const response = await this.http.fetch(this.url(`/channels/${channelId}/messages`), {
        method: "POST",
        headers: { ...this.botHeaders(botToken), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        return {
          success: false,
          error: { code: String(response.status), message: "Failed to create message" },
        };
      }
      const data = (await response.json()) as DiscordMessage;
      return { success: true, data: { id: data.id } };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  async getChannelMessages(
    botToken: string,
    channelId: string,
    limit: number = 50
  ): Promise<SocialApiResponse<DiscordMessage[]>> {
    try {
      const response = await this.http.fetch(this.url(`/channels/${channelId}/messages?limit=${limit}`), {
        method: "GET",
        headers: this.botHeaders(botToken),
      });
      if (!response.ok) {
        return {
          success: false,
          error: { code: String(response.status), message: "Failed to fetch messages" },
        };
      }
      return { success: true, data: (await response.json()) as DiscordMessage[] };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }
}
