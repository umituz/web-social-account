/**
 * Pinterest OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface PinterestErrorBody {
  message?: string;
}

export class PinterestOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("pinterest", config, http, storage);
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

  protected usesBasicAuth(): boolean {
    return true;
  }

  protected getRevokeUrl(_token: string): string {
    return "https://api.pinterest.com/v5/oauth/token/revoke";
  }

  protected getRevokeBody(token: string): Record<string, string> {
    return { token };
  }

  protected parseTokenError(data: unknown): string {
    const body = data as PinterestErrorBody | null;
    return body?.message ?? "Token exchange failed";
  }
}
