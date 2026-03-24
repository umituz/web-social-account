/**
 * Instagram API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { InstagramUser, InstagramMedia, InstagramContainer, InstagramError } from "../types/instagram.types";

export class InstagramApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://graph.instagram.com";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<InstagramUser>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,account_type,media_count,followers_count,follows_count,biography,profile_picture_url,website`,
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
            message: `Failed to fetch user profile: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as InstagramUser;

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
   * Create a container for media upload
   */
  async createContainer(
    accessToken: string,
    userId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const media = content.media?.[0];
      if (!media) {
        return {
          success: false,
          error: {
            code: "NO_MEDIA",
            message: "Instagram posts require at least one media item",
          },
        };
      }

      const params = new URLSearchParams();
      params.set("image_url", media.url);
      if (content.text) {
        params.set("caption", content.text);
      }

      const response = await fetch(
        `${this.baseUrl}/${userId}/media?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as InstagramError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to create container",
            details: error,
          },
        };
      }

      const data = (await response.json()) as { id: string };

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
   * Publish container
   */
  async publishContainer(
    accessToken: string,
    userId: string,
    containerId: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const params = new URLSearchParams();
      params.set("creation_id", containerId);

      const response = await fetch(
        `${this.baseUrl}/${userId}/media_publish?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as InstagramError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to publish",
            details: error,
          },
        };
      }

      const data = (await response.json()) as { id: string };

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
   * Get user's media
   */
  async getUserMedia(
    accessToken: string,
    limit: number = 10
  ): Promise<SocialApiResponse<InstagramMedia[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=${limit}`,
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
            message: `Failed to fetch media: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data?: InstagramMedia[] };

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
