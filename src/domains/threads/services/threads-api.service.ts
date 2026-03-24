/**
 * Threads API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { ThreadsUser, ThreadsPost, ThreadsContainer, ThreadsMediaContainer, ThreadsError } from "../types/threads.types";

export class ThreadsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://graph.threads.net/v1.0";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<ThreadsUser>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,threads_username,threads_profile_picture_url,biography`,
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

      const data = (await response.json()) as ThreadsUser;

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
   * Create a text post container
   */
  async createTextContainer(
    accessToken: string,
    userId: string,
    text: string,
    replyToId?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: Record<string, string> = {
        media_type: "TEXT_POST",
        text,
      };

      if (replyToId) {
        body.reply_to_id = replyToId;
      }

      const response = await fetch(
        `${this.baseUrl}/${userId}/threads?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as ThreadsError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to create text container",
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
   * Create a media container
   */
  async createMediaContainer(
    accessToken: string,
    userId: string,
    mediaUrl: string,
    altText?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: Record<string, string> = {
        media_type: "IMAGE",
        image_url: mediaUrl,
      };

      if (altText) {
        body.alt_text = altText;
      }

      const response = await fetch(
        `${this.baseUrl}/${userId}/threads?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as ThreadsError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to create media container",
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
   * Publish a container
   */
  async publishContainer(
    accessToken: string,
    containerId: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/threads/publish?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creation_id: containerId,
          }),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as ThreadsError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to publish container",
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
   * Get user's threads
   */
  async getUserThreads(
    accessToken: string,
    userId: string
  ): Promise<SocialApiResponse<ThreadsPost[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${userId}/threads?fields=id,text,media_type,permalink,timestamp,media`,
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
            message: `Failed to fetch threads: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data?: ThreadsPost[] };

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
