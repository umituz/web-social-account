/**
 * YouTube API Service
 */

import type { SocialApiResponse } from "../../../domain/types";
import type { YouTubeChannel, YouTubeVideo } from "../types/youtube.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export interface YouTubeVideoMetadata {
  title: string;
  description?: string;
  tags?: string[];
  privacy?: "public" | "private" | "unlisted";
}

export class YouTubeApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://www.googleapis.com/youtube/v3";
  }

  async getUserChannel(accessToken: string): Promise<SocialApiResponse<YouTubeChannel>> {
    return this.get<{ items: YouTubeChannel[] }>(
      "/channels?part=snippet,statistics&mine=true",
      accessToken,
      { noCache: true }
    ).then((response): SocialApiResponse<YouTubeChannel> => {
      if (!response.success) return response as unknown as SocialApiResponse<YouTubeChannel>;
      const items = response.data?.items;
      const channel = items?.[0];
      if (!channel) {
        return {
          success: false,
          error: { code: "NO_CHANNEL", message: "No channel found for this user" },
        };
      }
      return { success: true, data: channel };
    });
  }

  async uploadVideo(
    accessToken: string,
    videoFile: File,
    metadata: YouTubeVideoMetadata
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const initResponse = await this.http.fetch(this.url("/videos?uploadType=resumable&part=snippet,status"), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          snippet: {
            title: metadata.title,
            description: metadata.description ?? "",
            tags: metadata.tags ?? [],
            categoryId: "22",
          },
          status: { privacyStatus: metadata.privacy ?? "private" },
        }),
      });

      if (!initResponse.ok) {
        return {
          success: false,
          error: {
            code: String(initResponse.status),
            message: `Failed to initialize upload: ${initResponse.statusText}`,
          },
        };
      }

      const uploadUrl = initResponse.headers.get("Location");
      if (!uploadUrl) {
        return {
          success: false,
          error: { code: "NO_UPLOAD_URL", message: "Failed to get upload URL" },
        };
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "video/*" },
        body: videoFile,
      });

      if (!uploadResponse.ok) {
        return {
          success: false,
          error: {
            code: String(uploadResponse.status),
            message: `Failed to upload video: ${uploadResponse.statusText}`,
          },
        };
      }

      const data = (await uploadResponse.json()) as { id: string };
      return { success: true, data: { id: data.id } };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  async getVideoDetails(
    accessToken: string,
    videoId: string
  ): Promise<SocialApiResponse<YouTubeVideo>> {
    return this.get<{ items: YouTubeVideo[] }>(
      `/videos?part=snippet,statistics&id=${videoId}`,
      accessToken
    ).then((response): SocialApiResponse<YouTubeVideo> => {
      if (!response.success) return response as unknown as SocialApiResponse<YouTubeVideo>;
      const items = response.data?.items;
      const video = items?.[0];
      if (!video) {
        return {
          success: false,
          error: { code: "VIDEO_NOT_FOUND", message: "Video not found" },
        };
      }
      return { success: true, data: video };
    });
  }

  async getChannelVideos(
    accessToken: string,
    channelId: string,
    maxResults: number = 10
  ): Promise<SocialApiResponse<YouTubeVideo[]>> {
    return this.get<{ items: YouTubeVideo[] }>(
      `/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxResults}&order=date`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.items ?? [] ));
  }
}
