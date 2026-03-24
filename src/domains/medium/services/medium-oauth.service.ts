/**
 * Medium OAuth Service Implementation
 */

import type {
  IOAuthService,
  OAuthTokens,
  PlatformConfig,
} from "../../core";
import {
  OAuthError,
  InvalidTokenError,
  ConfigurationError,
  NetworkError,
} from "../../../../domain/errors";
import { PlatformConfigEntity } from "../../core/config/entities/platform-config.entity";

export class MediumOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("medium", "Invalid Medium OAuth configuration");
    }
  }

  async generateAuthorizationUrl(platform: string, userId?: string): Promise<{
    url: string;
    state: string;
  }> {
    try {
      const state = crypto.randomUUID();
      const url = new URL(this.config.oAuth.authorizationUrl);

      url.searchParams.set("client_id", this.config.oAuth.clientId);
      url.searchParams.set("redirect_uri", this.config.oAuth.redirectUri);
      url.searchParams.set("response_type", this.config.oAuth.responseType ?? "code");
      url.searchParams.set("scope", this.config.oAuth.scope.join(","));
      url.searchParams.set("state", state);

      return {
        url: url.toString(),
        state,
      };
    } catch (error) {
      throw new OAuthError(
        "medium",
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
      const response = await fetch(
        `${this.config.oAuth.tokenUrl}?client_id=${this.config.oAuth.clientId}&client_secret=${this.config.oAuth.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as MediumError;
        const errorMessage = error?.errors?.[0]?.message || "Token exchange failed";
        throw new OAuthError("medium", errorMessage, error);
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
      throw new NetworkError("medium", "Failed to exchange code for token", error);
    }
  }

  async refreshToken(
    platform: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    // Medium doesn't support refresh tokens
    return {
      accessToken: refreshToken,
      refreshToken,
      expiresIn: undefined,
    };
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    // Medium doesn't have token revocation endpoint
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
