/**
 * LinkedIn API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { LinkedInPost, LinkedInProfile } from "../types/linkedin.types";

export class LinkedInApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.linkedin.com/v2";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<LinkedInProfile>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/userinfo?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`,
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

      const data = (await response.json()) as LinkedInProfile;

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
   * Create a LinkedIn post
   */
  async createPost(
    accessToken: string,
    userId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const postBody = {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content.text,
            },
            shareMediaCategory: content.media && content.media.length > 0 ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postBody),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string };
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.message ?? "Failed to create post",
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
   * Get user's posts
   */
  async getUserPosts(
    accessToken: string,
    userId: string,
    count: number = 10
  ): Promise<SocialApiResponse<LinkedInPost[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ugcPosts?q=authors&authors=List(urn:li:person:${userId})&count=${count}`,
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
            message: `Failed to fetch posts: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { elements?: LinkedInPost[] };

      return {
        success: true,
        data: data.elements ?? [],
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
