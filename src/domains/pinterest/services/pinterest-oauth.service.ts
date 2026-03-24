/**
 * Pinterest OAuth Service Implementation
 */

import type {
  IOAuthService,
  OAuthTokens,
  PlatformConfig,
} from "../../../domain/types";
import {
  OAuthError,
  InvalidTokenError,
  ConfigurationError,
  NetworkError,
} from "../../../domain/errors";
import { PlatformConfigEntity } from "../../core/config/entities/platform-config.entity";

export class PinterestOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("pinterest", "Invalid Pinterest OAuth configuration");
    }
  }

  async generateAuthorizationUrl(platform: string, userId?: string): Promise<{
    url: string;
    state: string;
  }> {
    try {
      const state = crypto.randomUUID();
      const url = this.config.getAuthorizationUrl(state);

      return {
        url: url.toString(),
        state,
      };
    } catch (error) {
      throw new OAuthError(
        "pinterest",
        error instanceof Error ? error.message : "Failed to generate authorization URL",
        error
      );
    }
  }

  async exchangeCodeForToken(
    platform: string,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    try {
      const params = new URLSearchParams();
      params.set("grant_type", "authorization_code");
      params.set("code", code);
      params.set("redirect_uri", redirectUri);

      const credentials = btoa(`${this.config.oAuth.clientId}:${this.config.oAuth.clientSecret}`);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as PinterestError;
        throw new OAuthError("pinterest", error?.message || "Token exchange failed", error);
      }

      const data = (await response.json()) as OAuthTokens;

      const expiresIn = data.expiresIn ?? undefined;

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new NetworkError("pinterest", "Failed to exchange code for token", error);
    }
  }

  async refreshToken(
    platform: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    try {
      const params = new URLSearchParams();
      params.set("grant_type", "refresh_token");
      params.set("refresh_token", refreshToken);

      const credentials = btoa(`${this.config.oAuth.clientId}:${this.config.oAuth.clientSecret}`);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new InvalidTokenError("pinterest", { refreshToken });
      }

      const data = (await response.json()) as OAuthTokens;

      const expiresIn = data.expiresIn ?? undefined;

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof InvalidTokenError) throw error;
      throw new NetworkError("pinterest", "Failed to refresh token", error);
    }
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    try {
      await fetch("https://api.pinterest.com/v5/oauth/token/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ token }).toString(),
      });
    } catch (error) {
      throw new NetworkError("pinterest", "Failed to revoke token", error);
    }
  }

  async validateState(state: string): Promise<boolean> {
    return true;
  }

  async generatePKCEChallenge(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }> {
    return {
      codeVerifier: "",
      codeChallenge: "",
    };
  }
}
