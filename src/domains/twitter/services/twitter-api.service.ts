/**
 * Twitter API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { TwitterTweet, TwitterResponse, TwitterUser } from "../types/twitter.types";

export class TwitterApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.twitter.com/2";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<TwitterUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
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

      const data = (await response.json()) as TwitterResponse<TwitterUser>;

      return {
        success: true,
        data: data.data,
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
   * Create a tweet
   */
  async createTweet(
    accessToken: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: { text: string; media?: { media_ids: string[] } } = {
        text: content.text,
      };

      if (content.media && content.media.length > 0) {
        const mediaIds = await this.uploadMedia(accessToken, content.media);
        if (mediaIds.length > 0) {
          body.media = { media_ids: mediaIds };
        }
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { detail?: string; title?: string };
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.detail ?? error?.title ?? "Failed to create tweet",
            details: error,
          },
        };
      }

      const data = (await response.json()) as { data: { id: string } };

      return {
        success: true,
        data: data.data,
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
   * Upload media to Twitter
   */
  private async uploadMedia(
    accessToken: string,
    media: SocialPostContent["media"] = []
  ): Promise<string[]> {
    const mediaIds: string[] = [];

    for (const item of media.slice(0, 4)) {
      try {
        // Upload media using Twitter's media upload endpoint
        const response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: this.createFormData(item),
        });

        if (response.ok) {
          const data = (await response.json()) as { media_id_string: string };
          mediaIds.push(data.media_id_string);
        }
      } catch (error) {
        console.error("Failed to upload media:", error);
      }
    }

    return mediaIds;
  }

  private createFormData(item: NonNullable<SocialPostContent["media"]>[0]): FormData {
    const form = new FormData();
    // Implementation depends on media type
    // This is a placeholder for the actual media upload logic
    return form;
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(
    accessToken: string,
    maxResults: number = 10
  ): Promise<SocialApiResponse<TwitterTweet[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/me/tweets?max_results=${maxResults}`,
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
            message: `Failed to fetch tweets: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data?: TwitterTweet[] };

      return {
        success: true,
        data: data.data ?? [],
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
