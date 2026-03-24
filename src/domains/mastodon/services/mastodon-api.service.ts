/**
 * Mastodon API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type {
  MastodonAccount,
  MastodonStatus,
  MastodonError,
} from "../types/mastodon.types";

export class MastodonApiService {
  private instanceUrl: string;

  constructor(instanceUrl: string = "https://mastodon.social") {
    this.instanceUrl = instanceUrl;
  }

  /**
   * Get user profile (verified account)
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<MastodonAccount>> {
    try {
      const response = await fetch(`${this.instanceUrl}/api/v1/accounts/verify_credentials`, {
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

      const data = (await response.json()) as MastodonAccount;

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
   * Create a status (post)
   */
  async createStatus(
    accessToken: string,
    content: SocialPostContent,
    visibility: "public" | "unlisted" | "private" | "direct" = "public"
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: Record<string, unknown> = {
        status: content.text,
        visibility,
      };

      if (content.media && content.media.length > 0) {
        // First upload media
        const mediaIds = await Promise.all(
          content.media.map((media) => this.uploadMedia(accessToken, media.url, media.altText))
        );

        const validMediaIds = mediaIds
          .filter((result) => result.success)
          .map((result) => result.data);

        if (validMediaIds.length > 0) {
          body.media_ids = validMediaIds;
        }
      }

      if (content.link) {
        body.status = `${content.text}\n\n${content.link}`;
      }

      const response = await fetch(`${this.instanceUrl}/api/v1/statuses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as MastodonError;
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.error || "Failed to create status",
            details: error,
          },
        };
      }

      const data = (await response.json()) as MastodonStatus;

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
   * Upload media
   */
  private async uploadMedia(
    accessToken: string,
    url: string,
    description?: string
  ): Promise<SocialApiResponse<string>> {
    try {
      const formData = new FormData();
      formData.append("url", url);

      if (description) {
        formData.append("description", description);
      }

      const response = await fetch(`${this.instanceUrl}/api/v2/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to upload media: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as { id: string };

      return {
        success: true,
        data: data.id,
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
   * Get user's statuses
   */
  async getUserStatuses(
    accessToken: string,
    limit: number = 20
  ): Promise<SocialApiResponse<MastodonStatus[]>> {
    try {
      const response = await fetch(
        `${this.instanceUrl}/api/v1/accounts/verify_credentials/statuses?limit=${limit}`,
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
            message: `Failed to fetch statuses: ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as MastodonStatus[];

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
   * Delete a status
   */
  async deleteStatus(
    accessToken: string,
    statusId: string
  ): Promise<SocialApiResponse<void>> {
    try {
      const response = await fetch(`${this.instanceUrl}/api/v1/statuses/${statusId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Failed to delete status: ${response.statusText}`,
          },
        };
      }

      return {
        success: true,
        data: undefined,
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
