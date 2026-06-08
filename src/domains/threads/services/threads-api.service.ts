/**
 * Threads API Service
 */

import type { SocialApiResponse } from "../../../domain/types";
import type { ThreadsUser, ThreadsPost } from "../types/threads.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class ThreadsApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://graph.threads.net/v1.0";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<ThreadsUser>> {
    return this.get<ThreadsUser>(
      "/me?fields=id,username,threads_username,threads_profile_picture_url,biography",
      accessToken,
      { noCache: true }
    );
  }

  async createTextContainer(
    accessToken: string,
    userId: string,
    text: string,
    replyToId?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, string> = { media_type: "TEXT_POST", text };
    if (replyToId) body.reply_to_id = replyToId;
    return this.post<{ id: string }>(`/${userId}/threads`, accessToken, body);
  }

  async createMediaContainer(
    accessToken: string,
    userId: string,
    mediaUrl: string,
    altText?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, string> = {
      media_type: "IMAGE",
      image_url: mediaUrl,
    };
    if (altText) body.alt_text = altText;
    return this.post<{ id: string }>(`/${userId}/threads`, accessToken, body);
  }

  async publishContainer(
    accessToken: string,
    containerId: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    return this.post<{ id: string }>("/threads/publish", accessToken, {
      creation_id: containerId,
    });
  }

  async getUserThreads(
    accessToken: string,
    userId: string
  ): Promise<SocialApiResponse<ThreadsPost[]>> {
    return this.get<{ data?: ThreadsPost[] }>(
      `/${userId}/threads?fields=id,text,media_type,permalink,timestamp,media`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ?? [] ));
  }
}
