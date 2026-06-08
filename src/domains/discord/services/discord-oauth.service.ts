/**
 * Discord OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface DiscordErrorBody {
  message?: string;
}

export class DiscordOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("discord", config, http, storage);
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      client_id: this.config.oAuth.clientId,
      redirect_uri: this.config.oAuth.redirectUri,
      response_type: this.config.oAuth.responseType ?? "code",
      scope: this.config.oAuth.scope.join(" "),
      state,
    };
  }

  protected getTokenRequestBody(code: string, redirectUri: string): TokenRequestBody {
    return {
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };
  }

  protected getRevokeUrl(_token: string): string {
    return `${this.config.oAuth.tokenUrl}/revoke`;
  }

  protected parseTokenError(data: unknown): string {
    const body = data as DiscordErrorBody | null;
    return body?.message ?? "Token exchange failed";
  }
}
