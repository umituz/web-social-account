/**
 * Medium API Service
 *
 * Medium returns data wrapped in `{ data: ... }`. The base parser
 * already handles JSON error parsing for non-2xx responses; on success we
 * unwrap the `data` envelope for ergonomic return shapes.
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { MediumUser, MediumPublication, MediumPost } from "../types/medium.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class MediumApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://api.medium.com/v1";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<MediumUser>> {
    return this.get<{ data: MediumUser }>("/me", accessToken, { noCache: true }).then(
      (response) => ({
        success: response.success,
        data: response.success ? response.data?.data : undefined,
        ...(response.success ? {} : { error: response.error }),
      })
    );
  }

  async getUserPublications(
    accessToken: string
  ): Promise<SocialApiResponse<MediumPublication[]>> {
    const userResponse = await this.getUserProfile(accessToken);
    if (!userResponse.success || !userResponse.data) {
      return {
        success: false,
        error: userResponse.error ?? { code: "NO_USER", message: "Failed to load user" },
      };
    }
    return this.get<{ data: MediumPublication[] }>(
      `/users/${userResponse.data.id}/publications`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ));
  }

  async createPost(
    accessToken: string,
    authorId: string,
    content: SocialPostContent,
    publishStatus: "draft" | "public" | "unlisted" = "draft",
    publicationId?: string
  ): Promise<SocialApiResponse<{ id: string }>> {
    const body: Record<string, unknown> = {
      title: content.text.split("\n")[0].substring(0, 100),
      contentFormat: "html",
      content: this.buildHtmlContent(content),
      publishStatus,
    };
    if (publicationId) body.publicationId = publicationId;

    const path = publicationId
      ? `/publications/${publicationId}/posts`
      : `/users/${authorId}/posts`;

    return this.post<{ data: { id: string } }>(path, accessToken, body).then((response) => ({
      success: response.success,
      data: response.success ? { id: response.data?.data?.id ?? "" } : undefined,
      ...(response.success ? {} : { error: response.error }),
    }));
  }

  async getUserPosts(accessToken: string): Promise<SocialApiResponse<MediumPost[]>> {
    const userResponse = await this.getUserProfile(accessToken);
    if (!userResponse.success || !userResponse.data) {
      return {
        success: false,
        error: userResponse.error ?? { code: "NO_USER", message: "Failed to load user" },
      };
    }
    return this.get<{ data: MediumPost[] }>(
      `/users/${userResponse.data.id}/posts`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data ));
  }

  private buildHtmlContent(content: SocialPostContent): string {
    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let html = `<p>${escape(content.text)}</p>`;

    if (content.media && content.media.length > 0) {
      const m = content.media[0];
      const alt = m.altText ? ` alt="${escape(m.altText)}"` : "";
      html += `<figure><img src="${escape(m.url)}"${alt}></figure>`;
    }

    if (content.link) {
      html += `<p><a href="${escape(content.link)}">${escape(content.link)}</a></p>`;
    }

    if (content.hashtags && content.hashtags.length > 0) {
      html += `<p>${content.hashtags
        .map((tag) => `<a href="https://medium.com/tag/${escape(tag.replace("#", ""))}">${escape(tag)}</a>`)
        .join(" ")}</p>`;
    }

    return html;
  }
}
