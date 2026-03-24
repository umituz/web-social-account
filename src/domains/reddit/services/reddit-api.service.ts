/**
 * Reddit API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { RedditUser, RedditPost, RedditSubreddit, RedditError } from "../types/reddit.types";

export class RedditApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://oauth.reddit.com";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<RedditUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/me`, {
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

      const data = (await response.json()) as RedditUser;

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
   * Submit a post to subreddit
   */
  async submitPost(
    accessToken: string,
    subreddit: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string; url: string }>> {
    try {
      const body: Record<string, string> = {
        sr: subreddit,
        title: content.text.split("\n")[0].substring(0, 300),
        kind: content.media ? "image" : "self",
      };

      if (content.media) {
        body.url = content.media[0].url;
      } else {
        body.text = content.text;
      }

      if (content.link) {
        body.kind = "link";
        body.url = content.link;
      }

      const response = await fetch(`${this.baseUrl}/api/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_type: "json",
          ...body,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as RedditError;
        return {
          success: false,
          error: {
            code: error?.error?.toString() || response.status.toString(),
            message: error?.message || "Failed to submit post",
            details: error,
          },
        };
      }

      const data = (await response.json()) as { json: { data: { id: string; url: string } } };

      return {
        success: true,
        data: data.json.data,
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
    limit: number = 25
  ): Promise<SocialApiResponse<RedditPost[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/me/submitted?limit=${limit}`,
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

      const data = (await response.json()) as { data: { children: Array<{ data: RedditPost }> } };

      return {
        success: true,
        data: data.data.children.map((child) => child.data),
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
   * Get subreddit info
   */
  async getSubredditInfo(
    accessToken: string,
    subreddit: string
  ): Promise<SocialApiResponse<RedditSubreddit>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/r/${subreddit}/about`,
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
            message: `Failed to fetch subreddit info: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { data: RedditSubreddit };

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
