/**
 * Mastodon API Service
 *
 * Mastodon is federated; the instance URL must be supplied at construction
 * time. Override `url()` so the base URL is the instance URL and not the
 * class-level constant.
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { MastodonAccount, MastodonStatus } from "../types/mastodon.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class MastodonApiService extends BaseApiService {
  private readonly instanceUrl: string;

  constructor(instanceUrl: string = "https://mastodon.social", http: HttpClient = new HttpClient()) {
    super(http);
    this.instanceUrl = instanceUrl.replace(/\/+$/, "");
  }

  protected baseUrl(): string {
    return this.instanceUrl;
  }

  protected url(path: string): string {
    return `${this.instanceUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<MastodonAccount>> {
    return this.get<MastodonAccount>("/api/v1/accounts/verify_credentials", accessToken, {
      noCache: true,
    });
  }

  async createStatus(
    accessToken: string,
    content: SocialPostContent,
    visibility: "public" | "unlisted" | "private" | "direct" = "public"
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, unknown> = { status: content.text, visibility };

    if (content.media && content.media.length > 0) {
      const mediaIds: string[] = [];
      for (const media of content.media) {
        const upload = await this.uploadMedia(accessToken, media.url, media.altText);
        if (upload.success && upload.data) mediaIds.push(upload.data);
      }
      if (mediaIds.length > 0) body.media_ids = mediaIds;
    }

    if (content.link) body.status = `${content.text}\n\n${content.link}`;

    return this.post<MastodonStatus>("/api/v1/statuses", accessToken, body).then(
      (response) => this.mapData(response, (data) => ({ id: data.id }))
    );
  }

  async getUserStatuses(
    accessToken: string,
    limit: number = 20
  ): Promise<SocialApiResponse<MastodonStatus[]>> {
    return this.get<MastodonStatus[]>(
      `/api/v1/accounts/verify_credentials/statuses?limit=${limit}`,
      accessToken
    );
  }

  async deleteStatus(
    accessToken: string,
    statusId: string
  ): Promise<SocialApiResponse<void>> {
    return this.delete<void>(`/api/v1/statuses/${statusId}`, accessToken);
  }

  private async uploadMedia(
    accessToken: string,
    url: string,
    description?: string
  ): Promise<SocialApiResponse<string>> {
    try {
      const form = new FormData();
      form.append("url", url);
      if (description) form.append("description", description);

      const response = await this.http.fetch(this.url("/api/v2/media"), {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: form,
      });
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: `Failed to upload media: ${response.statusText}`,
          },
        };
      }
      const data = (await response.json()) as { id: string };
      return { success: true, data: data.id };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }
}
