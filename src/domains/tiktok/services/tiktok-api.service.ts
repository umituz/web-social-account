/**
 * TikTok API Service
 */

import type { SocialApiResponse } from "../../../domain/types";
import type { TikTokUser, TikTokVideo } from "../types/tiktok.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface TikTokPublishData {
  publish_id?: string;
  video_id?: string;
}

export class TikTokApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://open.tiktokapis.com/v2";
  }

  async getUserProfile(
    accessToken: string,
    openId: string
  ): Promise<SocialApiResponse<TikTokUser>> {
    return this.get<{ data: { user: TikTokUser } }>(
      `/user/info/?open_id=${openId}&fields=display_name,avatar_url,profile_deep_link,bio_description,is_verified,follower_count,following_count,likes_count,video_count`,
      accessToken,
      { noCache: true }
    ).then((response) => this.mapData(response, (data) => data.data.user ));
  }

  async initializeVideoUpload(
    accessToken: string,
    videoUrl: string
  ): Promise<SocialApiResponse<{ publish_id: string }>> {
    return this.post<{ data: TikTokPublishData }>(
      "/video/publish/initialize/",
      accessToken,
      { video_url: videoUrl }
    ).then((response) => ({
      success: response.success,
      data: response.success
        ? { publish_id: response.data?.data?.publish_id ?? "" }
        : undefined,
      ...(response.success ? {} : { error: response.error }),
    }));
  }

  async publishVideo(
    accessToken: string,
    publishId: string,
    caption?: string,
    privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIEND" | "SELF" = "PUBLIC_TO_EVERYONE"
  ): Promise<SocialApiResponse<{ video_id: string }>> {
    return this.post<{ data: TikTokPublishData }>(
      "/video/publish/",
      accessToken,
      {
        publish_id: publishId,
        caption: caption ?? "",
        privacy_level: privacyLevel,
      }
    ).then((response) => ({
      success: response.success,
      data: response.success
        ? { video_id: response.data?.data?.video_id ?? "" }
        : undefined,
      ...(response.success ? {} : { error: response.error }),
    }));
  }

  async getUserVideos(
    accessToken: string,
    openId: string,
    maxCount: number = 20
  ): Promise<SocialApiResponse<TikTokVideo[]>> {
    return this.get<{ data: { videos: TikTokVideo[] } }>(
      `/video/list/?open_id=${openId}&max_count=${maxCount}&fields=id,video_description,video_url,cover_image_url,create_time,duration,width,height,like_count,comment_count,share_count,view_count`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data.videos ?? [] ));
  }
}
