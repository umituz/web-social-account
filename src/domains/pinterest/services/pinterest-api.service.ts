/**
 * Pinterest API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { PinterestUser, PinterestBoard, PinterestPin, PinterestError } from "../types/pinterest.types";

export class PinterestApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.pinterest.com/v5";
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<PinterestUser>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user_account`,
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

      const data = (await response.json()) as PinterestUser;

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
   * Get user's boards
   */
  async getUserBoards(
    accessToken: string,
    pageSize: number = 25
  ): Promise<SocialApiResponse<PinterestBoard[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/boards?page_size=${pageSize}`,
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
            message: `Failed to fetch boards: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { items?: PinterestBoard[] };

      return {
        success: true,
        data: data.items ?? [],
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
   * Create a pin
   */
  async createPin(
    accessToken: string,
    boardId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const media = content.media?.[0];

      if (!media) {
        return {
          success: false,
          error: {
            code: "NO_MEDIA",
            message: "Pinterest posts require at least one media item",
          },
        };
      }

      const body: Record<string, string> = {
        board_id: boardId,
        media_source: {
          source_type: "external_url",
          url: media.url,
        } as unknown as string,
      };

      if (content.link) {
        body.link = content.link;
      }

      if (content.text) {
        body.description = content.text;
      }

      if (media.altText) {
        body.alt_text = media.altText;
      }

      const response = await fetch(
        `${this.baseUrl}/pins`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as PinterestError;
        return {
          success: false,
          error: {
            code: error?.code?.toString() || response.status.toString(),
            message: error?.message || "Failed to create pin",
            details: error,
          },
        };
      }

      const data = (await response.json()) as PinterestPin;

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
   * Get board's pins
   */
  async getBoardPins(
    accessToken: string,
    boardId: string,
    pageSize: number = 25
  ): Promise<SocialApiResponse<PinterestPin[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/boards/${boardId}/pins?page_size=${pageSize}`,
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
            message: `Failed to fetch pins: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { items?: PinterestPin[] };

      return {
        success: true,
        data: data.items ?? [],
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
