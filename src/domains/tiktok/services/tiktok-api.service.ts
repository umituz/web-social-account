/**
 * TikTok API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { TikTokUser, TikTokVideo, TikTokPublishResponse, TikTokError } from "../types/tiktok.types";

export class TikTokApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://open.tiktokapis.com/v2";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string, openId: string): Promise<SocialApiResponse<TikTokUser>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/info/?open_id=${openId}&fields=display_name,avatar_url,profile_deep_link,bio_description,is_verified,follower_count,following_count,likes_count,video_count`,
        {
          method: "GET",
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

      const data = (await response.json()) as { data: { user: TikTokUser } };

      return {
        success: true,
        data: data.data.user,
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
   * Initialize video upload
   */
  async initializeVideoUpload(
    accessToken: string,
    videoUrl: string
  ): Promise<SocialApiResponse<{ publish_id: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/video/publish/initialize/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as TikTokError;
        return {
          success: false,
          error: {
            code: error?.error?.code || response.status.toString(),
            message: error?.error?.message || "Failed to initialize video upload",
            details: error,
          },
        };
      }

      const data = (await response.json()) as TikTokPublishResponse;

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
   * Publish video with caption
   */
  async publishVideo(
    accessToken: string,
    publishId: string,
    caption?: string,
    privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIEND" | "SELF"
  ): Promise<SocialApiResponse<{ video_id: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/video/publish/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publish_id: publishId,
          caption: caption || "",
          privacy_level: privacyLevel || "PUBLIC_TO_EVERYONE",
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as TikTokError;
        return {
          success: false,
          error: {
            code: error?.error?.code || response.status.toString(),
            message: error?.error?.message || "Failed to publish video",
            details: error,
          },
        };
      }

      const data = (await response.json()) as TikTokPublishResponse;

      return {
        success: true,
        data: { video_id: data.data.video_id || "" },
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
   * Get user's videos
   */
  async getUserVideos(
    accessToken: string,
    openId: string,
    maxCount: number = 20
  ): Promise<SocialApiResponse<TikTokVideo[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/list/?open_id=${openId}&max_count=${maxCount}&fields=id,video_description,video_url,cover_image_url,create_time,duration,width,height,like_count,comment_count,share_count,view_count`,
        {
          method: "GET",
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

      const data = (await response.json()) as { data: { videos: TikTokVideo[] } };

      return {
        success: true,
        data: data.data.videos || [],
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
