/**
 * Threads OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface ThreadsErrorBody {
  error?: { message?: string };
}

export class ThreadsOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("threads", config, http, storage);
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
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    };
  }

  protected getRevokeUrl(token: string): string {
    return `https://graph.threads.net/v1.0/me/permissions?access_token=${token}`;
  }

  protected getRevokeBody(_token: string): Record<string, string> {
    return {};
  }

  protected parseTokenError(data: unknown): string {
    const body = data as ThreadsErrorBody | null;
    return body?.error?.message ?? "Token exchange failed";
  }
}
