/**
 * Twitter API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { TwitterUser, TwitterTweet } from "../types/twitter.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";
import { TWITTER_LIMITS } from "../../../shared/limits/twitter";
import { chunkItems, clampRequestedCount } from "../../../shared/calculations";

export interface MediaUploadResult {
  mediaId: string | null;
}

export class TwitterApiService extends BaseApiService {
  private static readonly UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://api.twitter.com/2";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<TwitterUser>> {
    return this.get<TwitterUser>("/users/me", accessToken, { noCache: true });
  }

  async createTweet(
    accessToken: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: { text: string; media?: { media_ids: string[] } } = { text: content.text };

    if (content.media && content.media.length > 0) {
      const mediaIds = await this.uploadMediaParallel(accessToken, content.media);
      if (mediaIds.length > 0) {
        body.media = { media_ids: mediaIds };
      }
    }

    return this.post<{ data: { id: string } }>("/tweets", accessToken, body).then(
      (response) => ({
        success: response.success,
        data: response.success ? response.data?.data : undefined,
        ...(response.success ? {} : { error: response.error }),
      })
    );
  }

  async getUserTweets(
    accessToken: string,
    maxResults: number = 10
  ): Promise<SocialApiResponse<TwitterTweet[]>> {
    const safe = clampRequestedCount({
      requested: maxResults,
      defaultValue: 10,
      min: 1,
      max: 100,
    });
    return this.get<{ data?: TwitterTweet[] }>(
      `/users/me/tweets?max_results=${safe}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ?? [] ));
  }

  private async uploadMediaParallel(
    accessToken: string,
    media: SocialPostContent["media"] = []
  ): Promise<string[]> {
    const mediaItems = media.slice(0, TWITTER_LIMITS.MAX_MEDIA_PER_TWEET);
    const mediaIds: string[] = [];

    const chunks = chunkItems(mediaItems, TWITTER_LIMITS.MAX_PARALLEL_UPLOADS);
    for (const batch of chunks) {
      const results = await Promise.allSettled(
        batch.map((item) => this.uploadSingleMedia(accessToken, item))
      );
      for (const result of results) {
        if (result.status === "fulfilled" && result.value !== null) {
          mediaIds.push(result.value);
        }
      }
    }

    return mediaIds;
  }

  private async uploadSingleMedia(
    accessToken: string,
    item: NonNullable<SocialPostContent["media"]>[0]
  ): Promise<string | null> {
    try {
      const form = new FormData();
      form.append("media_data", item.url);
      form.append("media_category", item.type === "video" ? "tweet_video" : "tweet_image");

      const response = await fetch(TwitterApiService.UPLOAD_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      if (!response.ok) return null;
      const data = (await response.json()) as { media_id_string?: string };
      return data.media_id_string ?? null;
    } catch (error) {
      console.error("Failed to upload media:", error);
      return null;
    }
  }
}
