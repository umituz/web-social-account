/**
 * Pinterest API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { PinterestUser, PinterestBoard, PinterestPin } from "../types/pinterest.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class PinterestApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://api.pinterest.com/v5";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<PinterestUser>> {
    return this.get<PinterestUser>("/user_account", accessToken, { noCache: true });
  }

  async getUserBoards(
    accessToken: string,
    pageSize: number = 25
  ): Promise<SocialApiResponse<PinterestBoard[]>> {
    return this.get<{ items?: PinterestBoard[] }>(
      `/boards?page_size=${pageSize}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.items ?? [] ));
  }

  async createPin(
    accessToken: string,
    boardId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    const media = content.media?.[0];
    if (!media) {
      return {
        success: false,
        error: { code: "NO_MEDIA", message: "Pinterest posts require at least one media item" },
      };
    }

    const body: Record<string, unknown> = {
      board_id: boardId,
      media_source: { source_type: "external_url", url: media.url },
    };
    if (content.link) body.link = content.link;
    if (content.text) body.description = content.text;
    if (media.altText) body.alt_text = media.altText;

    return this.post<PinterestPin>("/pins", accessToken, body).then((response) => ({
      success: response.success,
      data: response.success ? { id: response.data?.id ?? '' } : undefined,
      ...(response.success ? {} : { error: response.error }),
    }));
  }

  async getBoardPins(
    accessToken: string,
    boardId: string,
    pageSize: number = 25
  ): Promise<SocialApiResponse<PinterestPin[]>> {
    return this.get<{ items?: PinterestPin[] }>(
      `/boards/${boardId}/pins?page_size=${pageSize}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.items ?? [] ));
  }
}
