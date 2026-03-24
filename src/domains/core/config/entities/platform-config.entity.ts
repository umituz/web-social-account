/**
 * Platform Config Entity
 */

import type { PlatformConfig, SocialPlatform } from "../../../../domain/types";

export class PlatformConfigEntity implements PlatformConfig {
  oAuth: PlatformConfig["oAuth"];
  apiTimeout: number;
  maxRetries: number;

  constructor(config: PlatformConfig) {
    this.oAuth = config.oAuth;
    this.apiTimeout = config.apiTimeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  getAuthorizationUrl(state: string, codeVerifier?: string): URL {
    const url = new URL(this.oAuth.authorizationUrl);
    url.searchParams.set("response_type", this.oAuth.responseType ?? "code");
    url.searchParams.set("client_id", this.oAuth.clientId);
    url.searchParams.set("redirect_uri", this.oAuth.redirectUri);
    url.searchParams.set("scope", this.oAuth.scope.join(" "));
    url.searchParams.set("state", state);

    if (this.oAuth.pkce && codeVerifier) {
      url.searchParams.set("code_challenge", codeVerifier);
      url.searchParams.set(
        "code_challenge_method",
        this.oAuth.codeChallengeMethod ?? "S256"
      );
    }

    return url;
  }

  validate(): boolean {
    return !!(
      this.oAuth.clientId &&
      this.oAuth.clientSecret &&
      this.oAuth.redirectUri &&
      this.oAuth.scope.length > 0 &&
      this.oAuth.authorizationUrl &&
      this.oAuth.tokenUrl
    );
  }

  static fromPlatform(
    platform: SocialPlatform,
    config: Partial<PlatformConfig["oAuth"]> & {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    }
  ): PlatformConfigEntity {
    const platformConfigs: Record<
      SocialPlatform,
      Omit<PlatformConfig["oAuth"], "clientId" | "clientSecret" | "redirectUri">
    > = {
      twitter: {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        responseType: "code",
        pkce: true,
        codeChallengeMethod: "S256",
        authorizationUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.twitter.com/2/oauth2/token",
        baseUrl: "https://api.twitter.com/2",
      },
      linkedin: {
        scope: ["openid", "profile", "email", "w_member_social"],
        responseType: "code",
        authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        baseUrl: "https://api.linkedin.com/v2",
      },
      instagram: {
        scope: ["user_profile", "user_media"],
        responseType: "code",
        authorizationUrl: "https://api.instagram.com/oauth/authorize",
        tokenUrl: "https://api.instagram.com/oauth/access_token",
        baseUrl: "https://graph.instagram.com",
      },
      facebook: {
        scope: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
        responseType: "code",
        authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
        baseUrl: "https://graph.facebook.com/v18.0",
      },
      threads: {
        scope: ["threads_basic", "threads_content_write"],
        responseType: "code",
        authorizationUrl: "https://threads.net/oauth/authorize",
        tokenUrl: "https://graph.threads.net/oauth/access_token",
        baseUrl: "https://graph.threads.net",
      },
      tiktok: {
        scope: ["user.info.basic", "video.list"],
        responseType: "code",
        authorizationUrl: "https://open-api.tiktok.com/platform/oauth/connect/",
        tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
        baseUrl: "https://open-api.tiktok.com",
      },
      pinterest: {
        scope: ["read_public", "write_public"],
        responseType: "code",
        authorizationUrl: "https://www.pinterest.com/oauth/",
        tokenUrl: "https://api.pinterest.com/v5/oauth/token",
        baseUrl: "https://api.pinterest.com/v5",
      },
      reddit: {
        scope: ["identity", "submit", "read"],
        responseType: "code",
        authorizationUrl: "https://www.reddit.com/api/v1/authorize",
        tokenUrl: "https://www.reddit.com/api/v1/access_token",
        baseUrl: "https://oauth.reddit.com",
      },
      youtube: {
        scope: ["https://www.googleapis.com/auth/youtube.upload"],
        responseType: "code",
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        baseUrl: "https://www.googleapis.com/youtube/v3",
      },
      discord: {
        scope: ["identify", "bot"],
        responseType: "code",
        authorizationUrl: "https://discord.com/oauth2/authorize",
        tokenUrl: "https://discord.com/api/oauth2/token",
        baseUrl: "https://discord.com/api/v10",
      },
      telegram: {
        scope: ["bot"],
        responseType: "code",
        authorizationUrl: "https://telegram.org/auth",
        tokenUrl: "https://api.telegram.org/bot",
        baseUrl: "https://api.telegram.org",
      },
      mastodon: {
        scope: ["read", "write", "follow"],
        responseType: "code",
        authorizationUrl: "/oauth/authorize",
        tokenUrl: "/oauth/token",
      },
      medium: {
        scope: ["basicProfile", "publishPost"],
        responseType: "code",
        authorizationUrl: "https://medium.com/m/oauth/authorize",
        tokenUrl: "https://medium.com/v1/tokens",
        baseUrl: "https://api.medium.com/v1",
      },
    };

    const baseConfig = platformConfigs[platform];

    return new PlatformConfigEntity({
      oAuth: {
        ...baseConfig,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        scope: config.scope ?? baseConfig.scope,
      },
    });
  }
}
