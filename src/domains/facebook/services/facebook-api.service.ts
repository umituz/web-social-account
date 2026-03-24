/**
 * Facebook API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { FacebookUser, FacebookPost, FacebookPage, FacebookError } from "../types/facebook.types";

export class FacebookApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://graph.facebook.com/v18.0";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<FacebookUser>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,name,email,picture`,
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

      const data = (await response.json()) as FacebookUser;

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
   * Get user's pages
   */
  async getUserPages(accessToken: string): Promise<SocialApiResponse<FacebookPage[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/accounts?fields=id,name,category,access_token,tasks`,
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
            message: `Failed to fetch pages: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data?: FacebookPage[] };

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

  /**
   * Create a page post
   */
  async createPagePost(
    pageId: string,
    pageAccessToken: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: Record<string, unknown> = {
        message: content.text,
      };

      if (content.link) {
        body.link = content.link;
      }

      if (content.media && content.media.length > 0) {
        const mediaUrl = content.media[0].url;
        if (content.media[0].type === "image") {
          body.url = mediaUrl;
        }
      }

      const response = await fetch(
        `${this.baseUrl}/${pageId}/feed?access_token=${pageAccessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as FacebookError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error?.message || "Failed to create post",
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
   * Get page posts
   */
  async getPagePosts(
    pageId: string,
    pageAccessToken: string,
    limit: number = 10
  ): Promise<SocialApiResponse<FacebookPost[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${pageId}/posts?fields=id,message,permalink_url,created_time,full_picture,attachments&limit=${limit}&access_token=${pageAccessToken}`,
        {
          headers: {
            Authorization: `Bearer ${pageAccessToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch posts: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data?: FacebookPost[] };

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
