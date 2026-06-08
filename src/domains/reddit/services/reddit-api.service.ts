/**
 * Reddit API Service
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { RedditUser, RedditPost, RedditSubreddit } from "../types/reddit.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class RedditApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://oauth.reddit.com";
  }

  async getUserProfile(accessToken: string): Promise<SocialApiResponse<RedditUser>> {
    return this.get<RedditUser>("/api/v1/me", accessToken, { noCache: true });
  }

  async submitPost(
    accessToken: string,
    subreddit: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string; url: string }>> {
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

    return this.post<{ json: { data: { id: string; url: string } } }>(
      "/api/submit",
      accessToken,
      { api_type: "json", ...body }
    ).then((response) => this.mapData(response, (data) => data.json.data ));
  }

  async getUserPosts(
    accessToken: string,
    limit: number = 25
  ): Promise<SocialApiResponse<RedditPost[]>> {
    return this.get<{ data: { children: Array<{ data: RedditPost }> } }>(
      `/user/me/submitted?limit=${limit}`,
      accessToken
    ).then((response) => this.mapData(response, (data) => data.data.children.map((child) => child.data)
        ));
  }

  async getSubredditInfo(
    accessToken: string,
    subreddit: string
  ): Promise<SocialApiResponse<RedditSubreddit>> {
    return this.get<{ data: RedditSubreddit }>(`/r/${subreddit}/about`, accessToken).then(
      (response) => ({
        success: response.success,
        data: response.success ? response.data?.data : undefined,
        ...(response.success ? {} : { error: response.error }),
      })
    );
  }
}
