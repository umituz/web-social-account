/**
 * Twitter OAuth Service
 */

import type { PlatformConfig, SocialPlatform } from "../../../domain/types";
import { BaseOAuthService, TokenRequestBody, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class TwitterOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("twitter", config, http, storage);
  }

  protected supportsPKCE(): boolean {
    return true;
  }

  protected getAuthorizationParams(state: string, codeChallenge?: string): AuthorizationUrlParams {
    return {
      response_type: this.config.oAuth.responseType ?? "code",
      client_id: this.config.oAuth.clientId,
      redirect_uri: this.config.oAuth.redirectUri,
      scope: this.config.oAuth.scope.join(" "),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: this.config.oAuth.codeChallengeMethod ?? "S256",
    };
  }

  protected getTokenRequestBody(code: string, redirectUri: string): TokenRequestBody {
    return {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: this.config.oAuth.clientId,
    };
  }

  protected getRevokeUrl(_token: string): string {
    return "https://api.twitter.com/2/oauth2/revoke";
  }

  protected getRevokeBody(token: string): Record<string, string> {
    return { token, token_type_hint: "access_token" };
  }

  protected parseTokenError(data: unknown): string {
    if (data && typeof data === "object" && "error" in data) {
      const errorField = (data as { error?: string }).error;
      if (typeof errorField === "string") return `Token exchange failed: ${errorField}`;
    }
    return "Token exchange failed";
  }

  generateAuthorizationUrl(platform: SocialPlatform, userId?: string) {
    return super.generateAuthorizationUrl(platform, userId);
  }
}
