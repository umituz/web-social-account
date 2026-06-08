/**
 * Base OAuth Service - Template Method Pattern
 *
 * Provides the OAuth 2.0 authorization code flow skeleton.
 * Subclasses override only platform-specific extension points.
 */

import type {
  SocialPlatform,
  OAuthTokens,
  PlatformConfig,
} from "../../../../domain/types";
import { CryptoUtils } from "../../../../infrastructure/utils/crypto.util";
import { HttpClient } from "../../../../infrastructure/http/http-client.util";
import { PlatformConfigEntity } from "../../config/entities/platform-config.entity";
import { ISessionStorage } from "../../session/repositories/session-storage.interface";
import { IOAuthService, OAuthTokenResponse } from "./oauth-service.interface";
import {
  OAuthError,
  InvalidTokenError,
  ConfigurationError,
  NetworkError,
} from "../../../../domain/errors";
import { isStateExpired } from "../../../../shared/predicates";
import { STORAGE_DEFAULTS } from "../../../../shared/limits/storage-defaults";

export interface TokenRequestBody {
  grant_type?: string;
  code?: string;
  redirect_uri?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  [key: string]: string | undefined;
}

export interface AuthorizationUrlParams {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state: string;
  [key: string]: string | undefined;
}

export abstract class BaseOAuthService implements IOAuthService {
  protected readonly config: PlatformConfigEntity;
  protected readonly http: HttpClient;
  protected readonly storage: ISessionStorage | null;
  protected readonly platform: SocialPlatform;

  protected constructor(
    platform: SocialPlatform,
    config: PlatformConfig,
    http: HttpClient,
    storage: ISessionStorage | null = null
  ) {
    this.platform = platform;
    this.config = config instanceof PlatformConfigEntity
      ? config
      : new PlatformConfigEntity(config);
    this.http = http;
    this.storage = storage;

    if (!this.config.validate()) {
      throw new ConfigurationError(platform, `Invalid OAuth configuration for ${platform}`);
    }
  }

  /**
   * Platform-specific authorization URL parameters
   * Override to add extra params (e.g., access_type for Google)
   */
  protected abstract getAuthorizationParams(
    state: string,
    codeChallenge?: string
  ): AuthorizationUrlParams;

  /**
   * Platform-specific token request body
   * Override for different parameter names (e.g., client_key for TikTok)
   */
  protected abstract getTokenRequestBody(
    code: string,
    redirectUri: string
  ): TokenRequestBody;

  /**
   * Platform-specific refresh token body
   * Override for different parameter names
   */
  protected getRefreshTokenBody(refreshToken: string): TokenRequestBody {
    return {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.oAuth.clientId,
      client_secret: this.config.oAuth.clientSecret,
    };
  }

  /**
   * Whether the platform supports PKCE
   */
  protected supportsPKCE(): boolean {
    return this.config.oAuth.pkce === true;
  }

  /**
   * Whether the platform supports refresh tokens
   */
  protected supportsRefreshToken(): boolean {
    return true;
  }

  /**
   * Whether the platform supports token revocation
   */
  protected supportsRevoke(): boolean {
    return true;
  }

  /**
   * Whether the platform uses Basic Auth for token requests
   */
  protected usesBasicAuth(): boolean {
    return false;
  }

  /**
   * Whether the platform uses query params for token requests (instead of body)
   */
  protected usesQueryForTokenRequest(): boolean {
    return false;
  }

  /**
   * Override to provide a custom URL for token requests (e.g., Mastodon's instance URL)
   */
  protected getTokenUrl(): string {
    return this.config.oAuth.tokenUrl;
  }

  /**
   * Override to provide a custom authorization URL
   */
  protected getAuthorizationEndpoint(): string {
    return this.config.oAuth.authorizationUrl;
  }

  /**
   * Override to provide a custom revoke URL
   */
  protected getRevokeUrl(_token: string): string {
    return this.config.oAuth.tokenUrl;
  }

  /**
   * Override to provide custom revoke body
   */
  protected getRevokeBody(token: string): Record<string, string> {
    return { token };
  }

  /**
   * Override to parse token error responses (different error shapes per platform)
   */
  protected parseTokenError(_data: unknown): string {
    return "Token exchange failed";
  }

  async generateAuthorizationUrl(
    platform: SocialPlatform,
    userId?: string
  ): Promise<{ url: string; state: string }> {
    try {
      const state = CryptoUtils.generateState();
      let codeChallenge: string | undefined;

      if (this.supportsPKCE()) {
        const { codeChallenge: challenge } = await this.generatePKCEChallenge();
        codeChallenge = challenge;
      }

      const params = this.getAuthorizationParams(state, codeChallenge);
      const url = new URL(this.getAuthorizationEndpoint());

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }

      // Persist state for later validation
      if (this.storage) {
        await this.storage.setOAuthState(state, {
          state,
          codeVerifier: undefined,
          userId,
          timestamp: Date.now(),
          platform,
        });
      }

      return { url: url.toString(), state };
    } catch (error) {
      throw new OAuthError(
        this.platform,
        error instanceof Error ? error.message : "Failed to generate authorization URL",
        error
      );
    }
  }

  async exchangeCodeForToken(
    _platform: SocialPlatform,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const isStateValid = await this.validateState(state);
    if (!isStateValid) {
      throw new OAuthError(this.platform, "Invalid or expired state");
    }

    try {
      const body = this.getTokenRequestBody(code, redirectUri);
      const headers = this.buildTokenRequestHeaders();
      const response = await this.sendTokenRequest(body, headers);

      if (!response.ok) {
        const errorData = await this.safeParseJson(response);
        throw new OAuthError(
          this.platform,
          this.parseTokenError(errorData),
          errorData
        );
      }

      const data = (await response.json()) as OAuthTokens;
      return this.normalizeTokenResponse(data);
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new NetworkError(this.platform, "Failed to exchange code for token", error);
    }
  }

  async refreshToken(
    _platform: SocialPlatform,
    refreshToken: string
  ): Promise<OAuthTokenResponse> {
    if (!this.supportsRefreshToken()) {
      throw new OAuthError(this.platform, "Refresh tokens are not supported by this platform");
    }

    try {
      const body = this.getRefreshTokenBody(refreshToken);
      const headers = this.buildTokenRequestHeaders();
      const response = await this.sendTokenRequest(body, headers);

      if (!response.ok) {
        throw new InvalidTokenError(this.platform, { refreshToken });
      }

      const data = (await response.json()) as OAuthTokens;
      return this.normalizeTokenResponse(data);
    } catch (error) {
      if (error instanceof InvalidTokenError) throw error;
      throw new NetworkError(this.platform, "Failed to refresh token", error);
    }
  }

  async revokeToken(_platform: SocialPlatform, token: string): Promise<void> {
    if (!this.supportsRevoke()) {
      return;
    }

    try {
      const body = this.getRevokeBody(token);
      const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      await fetch(this.getRevokeUrl(token), {
        method: "POST",
        headers,
        body: new URLSearchParams(body).toString(),
      });
    } catch (error) {
      throw new NetworkError(this.platform, "Failed to revoke token", error);
    }
  }

  async validateState(state: string): Promise<boolean> {
    if (!this.storage) return true;

    const stored = await this.storage.getOAuthState(state);
    if (!stored) return false;
    if (isStateExpired(stored.timestamp, STORAGE_DEFAULTS.OAUTH_STATE_TTL_MS)) {
      await this.storage.removeOAuthState(state);
      return false;
    }
    return true;
  }

  async generatePKCEChallenge(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }> {
    const codeVerifier = CryptoUtils.generateRandomString(64);
    const codeChallenge = await CryptoUtils.generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
  }

  protected normalizeTokenResponse(data: OAuthTokens): OAuthTokenResponse {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  }

  protected buildTokenRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (this.usesBasicAuth()) {
      const credentials = btoa(
        `${this.config.oAuth.clientId}:${this.config.oAuth.clientSecret}`
      );
      headers.Authorization = `Basic ${credentials}`;
    }

    return headers;
  }

  protected async sendTokenRequest(
    body: TokenRequestBody,
    headers: Record<string, string>
  ): Promise<Response> {
    const url = this.getTokenUrl();
    const bodyString = new URLSearchParams(
      Object.entries(body).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();

    if (this.usesQueryForTokenRequest()) {
      const separator = url.includes("?") ? "&" : "?";
      return fetch(`${url}${separator}${bodyString}`, {
        method: "GET",
        headers,
      });
    }

    return fetch(url, {
      method: "POST",
      headers,
      body: bodyString,
    });
  }

  protected async safeParseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
