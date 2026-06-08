/**
 * Facebook OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface FacebookErrorBody {
  error?: { message?: string };
}

export class FacebookOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("facebook", config, http, storage);
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
      code,
      redirect_uri: redirectUri,
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
    };
  }

  protected getRefreshTokenBody(refreshToken: string): TokenRequestBody {
    return {
      grant_type: "fb_exchange_token",
      fb_exchange_token: refreshToken,
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
    };
  }

  protected usesQueryForTokenRequest(): boolean {
    return true;
  }

  protected getRevokeUrl(token: string): string {
    return `https://graph.facebook.com/v18.0/${token}/permissions`;
  }

  protected getRevokeBody(_token: string): Record<string, string> {
    return {};
  }

  protected parseTokenError(data: unknown): string {
    const body = data as FacebookErrorBody | null;
    return body?.error?.message ?? "Token exchange failed";
  }
}
