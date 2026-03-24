/**
 * Medium API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type {
  MediumUser,
  MediumPublication,
  MediumPost,
  MediumCreatePostResponse,
  MediumError,
} from "../types/medium.types";

export class MediumApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.medium.com/v1";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<MediumUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
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

      const data = (await response.json()) as { data: MediumUser };

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
   * Get user's publications
   */
  async getUserPublications(accessToken: string): Promise<SocialApiResponse<MediumPublication[]>> {
    try {
      const userResponse = await this.getUserProfile(accessToken);
      if (!userResponse.success) {
        return {
          success: false,
          error: userResponse.error,
        };
      }

      const response = await fetch(`${this.baseUrl}/users/${userResponse.data.id}/publications`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch publications: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data: MediumPublication[] };

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
   * Create a post
   */
  async createPost(
    accessToken: string,
    authorId: string,
    content: SocialPostContent,
    publishStatus: "draft" | "public" | "unlisted" = "draft",
    publicationId?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      // Convert content to HTML format
      let htmlContent = `<p>${content.text}</p>`;

      if (content.media && content.media.length > 0) {
        htmlContent += `<figure><img src="${content.media[0].url}"`;
        if (content.media[0].altText) {
          htmlContent += ` alt="${content.media[0].altText}"`;
        }
        htmlContent += "></figure>";
      }

      if (content.link) {
        htmlContent += `<p><a href="${content.link}">${content.link}</a></p>`;
      }

      if (content.hashtags && content.hashtags.length > 0) {
        htmlContent += `<p>${content.hashtags.map((tag) => `<a href="https://medium.com/tag/${tag.replace("#", "")}">${tag}</a>`).join(" ")}</p>`;
      }

      const body: Record<string, unknown> = {
        title: content.text.split("\n")[0].substring(0, 100),
        contentFormat: "html",
        content: htmlContent,
        publishStatus,
      };

      if (publicationId) {
        body.publicationId = publicationId;
      }

      const url = publicationId
        ? `${this.baseUrl}/publications/${publicationId}/posts`
        : `${this.baseUrl}/users/${authorId}/posts`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as MediumError;
        const errorMessage = error?.errors?.[0]?.message || "Failed to create post";
        return {
          success: false,
          error: {
            code: error?.errors?.[0]?.code?.toString() || response.status.toString(),
            message: errorMessage,
            details: error,
          },
        };
      }

      const data = (await response.json()) as MediumCreatePostResponse;

      return {
        success: true,
        data: { id: data.data.id },
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
  async getUserPosts(accessToken: string): Promise<SocialApiResponse<MediumPost[]>> {
    try {
      const userResponse = await this.getUserProfile(accessToken);
      if (!userResponse.success) {
        return {
          success: false,
          error: userResponse.error,
        };
      }

      const response = await fetch(`${this.baseUrl}/users/${userResponse.data.id}/posts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to fetch posts: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data: MediumPost[] };

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
}
