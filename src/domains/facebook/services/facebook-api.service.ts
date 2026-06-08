/**
 * Facebook API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { FacebookUser, FacebookPost, FacebookPage } from "../types/facebook.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class FacebookApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://graph.facebook.com/v18.0";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<FacebookUser>> {
    return this.get<FacebookUser>("/me?fields=id,name,email,picture", accessToken, {
      noCache: true,
    });
  }

  async getUserPages(accessToken: string): Promise<SocialApiResponse<FacebookPage[]>> {
    return this.get<{ data?: FacebookPage[] }>(
      "/me/accounts?fields=id,name,category,access_token,tasks",
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ?? [] ));
  }

  async createPagePost(
    pageId: string,
    pageAccessToken: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, unknown> = { message: content.text };
    if (content.link) body.link = content.link;
    if (content.media && content.media.length > 0 && content.media[0].type === "image") {
      body.url = content.media[0].url;
    }

    return this.post<{ id: string }>(`/${pageId}/feed`, pageAccessToken, body);
  }

  async getPagePosts(
    pageId: string,
    pageAccessToken: string,
    limit: number = 10
  ): Promise<SocialApiResponse<FacebookPost[]>> {
    return this.get<{ data?: FacebookPost[] }>(
      `/${pageId}/posts?fields=id,message,permalink_url,created_time,full_picture,attachments&limit=${limit}`,
      pageAccessToken
    ).then((response) => this.mapData(response, (data) => data.data ?? [] ));
  }
}
