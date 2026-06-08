/**
 * Instagram OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface InstagramErrorBody {
  error?: { message?: string };
}

export class InstagramOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("instagram", config, http, storage);
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
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
    };
  }

  protected getRefreshTokenBody(refreshToken: string): TokenRequestBody {
    return {
      grant_type: "ig_refresh_token",
      access_token: refreshToken,
    };
  }

  protected getTokenUrl(): string {
    return "https://graph.instagram.com/refresh_access_token";
  }

  protected buildTokenRequestHeaders(): Record<string, string> {
    return { "Content-Type": "application/x-www-form-urlencoded" };
  }

  protected getRevokeUrl(token: string): string {
    return `https://graph.instagram.com/${token}?access_token=${token}`;
  }

  protected getRevokeBody(_token: string): Record<string, string> {
    return {};
  }

  protected parseTokenError(data: unknown): string {
    const body = data as InstagramErrorBody | null;
    return body?.error?.message ?? "Token exchange failed";
  }
}
