/**
 * YouTube OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface YouTubeErrorBody {
  error?: { message?: string };
  error_description?: string;
}

export class YouTubeOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("youtube", config, http, storage);
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      client_id: this.config.oAuth.clientId,
      redirect_uri: this.config.oAuth.redirectUri,
      response_type: this.config.oAuth.responseType ?? "code",
      scope: this.config.oAuth.scope.join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
    };
  }

  protected getTokenRequestBody(code: string, redirectUri: string): TokenRequestBody {
    return {
      code,
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
  }

  protected getRevokeUrl(token: string): string {
    return `https://oauth2.googleapis.com/revoke?token=${token}`;
  }

  protected getRevokeBody(_token: string): Record<string, string> {
    return {};
  }

  protected parseTokenError(data: unknown): string {
    const body = data as YouTubeErrorBody | null;
    return body?.error?.message ?? body?.error_description ?? "Token exchange failed";
  }
}
