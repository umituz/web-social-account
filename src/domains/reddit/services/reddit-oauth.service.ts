/**
 * Reddit OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface RedditErrorBody {
  error?: string;
  message?: string;
}

export class RedditOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("reddit", config, http, storage);
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      client_id: this.config.oAuth.clientId,
      response_type: this.config.oAuth.responseType ?? "code",
      redirect_uri: this.config.oAuth.redirectUri,
      scope: this.config.oAuth.scope.join(" "),
      state,
      duration: "permanent",
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
    return "https://www.reddit.com/api/v1/revoke_token";
  }

  protected getRevokeBody(token: string): Record<string, string> {
    return { token, token_type_hint: "access_token" };
  }

  protected parseTokenError(data: unknown): string {
    const body = data as RedditErrorBody | null;
    return body?.message ?? "Token exchange failed";
  }
}
