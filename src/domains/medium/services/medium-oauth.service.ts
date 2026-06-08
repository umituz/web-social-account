/**
 * Medium OAuth Service
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface MediumErrorBody {
  errors?: Array<{ message?: string; code?: number | string }>;
}

export class MediumOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("medium", config, http, storage);
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      client_id: this.config.oAuth.clientId,
      redirect_uri: this.config.oAuth.redirectUri,
      response_type: this.config.oAuth.responseType ?? "code",
      scope: this.config.oAuth.scope.join(","),
      state,
    };
  }

  protected getTokenRequestBody(code: string, redirectUri: string): TokenRequestBody {
    return {
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    };
  }

  protected getRevokeUrl(_token: string): string {
    return this.config.oAuth.tokenUrl;
  }

  protected getRevokeBody(_token: string): Record<string, string> {
    return {};
  }

  protected supportsRefreshToken(): boolean {
    return false;
  }

  protected supportsRevoke(): boolean {
    return false;
  }

  protected parseTokenError(data: unknown): string {
    const body = data as MediumErrorBody | null;
    return body?.errors?.[0]?.message ?? "Token exchange failed";
  }
}
