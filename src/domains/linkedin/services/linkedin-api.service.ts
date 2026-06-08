/**
 * LinkedIn API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { LinkedInPost, LinkedInProfile } from "../types/linkedin.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class LinkedInApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://api.linkedin.com/v2";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<LinkedInProfile>> {
    return this.get<LinkedInProfile>(
      "/userinfo?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))",
      accessToken,
      { noCache: true }
    );
  }

  async createPost(
    accessToken: string,
    userId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    return this.post<{ id: string }>(
      "/ugcPosts",
      accessToken,
      {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content.text },
            shareMediaCategory: content.media && content.media.length > 0 ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      { headers: { "X-Restli-Protocol-Version": "2.0.0" } }
    );
  }

  async getUserPosts(
    accessToken: string,
    userId: string,
    count: number = 10
  ): Promise<SocialApiResponse<LinkedInPost[]>> {
    return this.get<{ elements?: LinkedInPost[] }>(
      `/ugcPosts?q=authors&authors=List(urn:li:person:${userId})&count=${count}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.elements ?? [] ));
  }
}
