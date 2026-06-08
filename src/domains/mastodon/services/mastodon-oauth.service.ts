/**
 * Mastodon OAuth Service
 *
 * Mastodon is federated: each instance has its own OAuth endpoint.
 * The instance URL is provided at construction time and used to compose
 * authorization, token, and revoke URLs.
 */

import type { PlatformConfig } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

interface MastodonErrorBody {
  error?: string;
}

export class MastodonOAuthService extends BaseOAuthService {
  private readonly instanceUrl: string;

  constructor(
    config: PlatformConfig,
    instanceUrl: string = "https://mastodon.social",
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("mastodon", config, http, storage);
    this.instanceUrl = instanceUrl.replace(/\/+$/, "");
  }

  protected getAuthorizationEndpoint(): string {
    return `${this.instanceUrl}${this.config.oAuth.authorizationUrl}`;
  }

  protected getTokenUrl(): string {
    return `${this.instanceUrl}${this.config.oAuth.tokenUrl}`;
  }

  protected getRevokeUrl(_token: string): string {
    return `${this.instanceUrl}/oauth/revoke`;
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
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
  }

  protected parseTokenError(data: unknown): string {
    const body = data as MastodonErrorBody | null;
    return body?.error ?? "Token exchange failed";
  }
}
