/**
 * YouTube API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { YouTubeChannel, YouTubeVideo, YouTubeError } from "../types/youtube.types";

export class YouTubeApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://www.googleapis.com/youtube/v3";
  }

  /**
   * Get user's channel
   */
  async getUserChannel(accessToken: string): Promise<SocialApiResponse<YouTubeChannel>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=snippet,statistics&mine=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch channel: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { items: YouTubeChannel[] };

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: {
            code: "NO_CHANNEL",
            message: "No channel found for this user",
          },
        };
      }

      return {
        success: true,
        data: data.items[0],
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
   * Upload video to YouTube
   */
  async uploadVideo(
    accessToken: string,
    videoFile: File,
    metadata: {
      title: string;
      description?: string;
      tags?: string[];
      privacy?: "public" | "private" | "unlisted";
    }
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      // Create upload session
      const initResponse = await fetch(
        `${this.baseUrl}/videos?uploadType=resumable&part=snippet,status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              title: metadata.title,
              description: metadata.description || "",
              tags: metadata.tags || [],
              categoryId: "22", // People & Blogs
            },
            status: {
              privacyStatus: metadata.privacy || "private",
            },
          }),
        }
      );

      if (!initResponse.ok) {
        return {
          success: false,
          error: {
            code: initResponse.status.toString(),
            message: `Failed to initialize upload: ${initResponse.statusText}`,
          },
        };
      }

      const uploadUrl = initResponse.headers.get("Location");
      if (!uploadUrl) {
        return {
          success: false,
          error: {
            code: "NO_UPLOAD_URL",
            message: "Failed to get upload URL",
          },
        };
      }

      // Upload video file
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "video/*",
        },
        body: videoFile,
      });

      if (!uploadResponse.ok) {
        return {
          success: false,
          error: {
            code: uploadResponse.status.toString(),
            message: `Failed to upload video: ${uploadResponse.statusText}`,
          },
        };
      }

      const data = (await uploadResponse.json()) as { id: string };

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
   * Get video details
   */
  async getVideoDetails(
    accessToken: string,
    videoId: string
  ): Promise<SocialApiResponse<YouTubeVideo>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics&id=${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch video details: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { items: YouTubeVideo[] };

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: {
            code: "VIDEO_NOT_FOUND",
            message: "Video not found",
          },
        };
      }

      return {
        success: true,
        data: data.items[0],
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
   * Get channel's videos
   */
  async getChannelVideos(
    accessToken: string,
    channelId: string,
    maxResults: number = 10
  ): Promise<SocialApiResponse<YouTubeVideo[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxResults}&order=date`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch videos: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { items: YouTubeVideo[] };

      return {
        success: true,
        data: data.items || [],
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
