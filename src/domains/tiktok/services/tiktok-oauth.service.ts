/**
 * TikTok OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface TikTokErrorBody {
  error?: { message?: string; code?: string };
}

export class TikTokOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("tiktok", config, http, storage);
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      response_type: this.config.oAuth.responseType ?? "code",
      client_id: this.config.oAuth.clientId,
      redirect_uri: this.config.oAuth.redirectUri,
      scope: this.config.oAuth.scope.join(" "),
      state,
    };
  }

  protected getTokenRequestBody(code: string, redirectUri: string): TokenRequestBody {
    return {
      client_key: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    };
  }

  protected getRefreshTokenBody(refreshToken: string): TokenRequestBody {
    return {
      client_key: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
  }

  protected getRevokeUrl(_token: string): string {
    return "https://open.tiktokapis.com/v2/oauth/revoke/";
  }

  protected getRevokeBody(token: string): Record<string, string> {
    return { access_token: token };
  }

  protected parseTokenError(data: unknown): string {
    const body = data as TikTokErrorBody | null;
    return body?.error?.message ?? "Token exchange failed";
  }
}
