/**
 * Instagram API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { InstagramUser, InstagramMedia } from "../types/instagram.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class InstagramApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://graph.instagram.com";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<InstagramUser>> {
    return this.get<InstagramUser>(
      "/me?fields=id,username,account_type,media_count,followers_count,follows_count,biography,profile_picture_url,website",
      accessToken,
      { noCache: true }
    );
  }

  async createContainer(
    accessToken: string,
    userId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    const media = content.media?.[0];
    if (!media) {
      return {
        success: false,
        error: { code: "NO_MEDIA", message: "Instagram posts require at least one media item" },
      };
    }

    const body: Record<string, string> = { image_url: media.url };
    if (content.text) body.caption = content.text;

    return this.postForm<{ id: string }>(`/${userId}/media`, accessToken, body);
  }

  async publishContainer(
    accessToken: string,
    userId: string,
    containerId: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    return this.postForm<{ id: string }>(
      `/${userId}/media_publish`,
      accessToken,
      { creation_id: containerId }
    );
  }

  async getUserMedia(
    accessToken: string,
    limit: number = 10
  ): Promise<SocialApiResponse<InstagramMedia[]>> {
    return this.get<{ data?: InstagramMedia[] }>(
      `/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=${limit}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ?? [] ));
  }
}
