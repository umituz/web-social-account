/**
 * Instagram OAuth Service Implementation
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
} from "../../../domain/errors";
import { PlatformConfigEntity } from "../../core/config/entities/platform-config.entity";

export class InstagramOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("instagram", "Invalid Instagram OAuth configuration");
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
        "instagram",
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
      params.set("client_id", this.config.oAuth.clientId);
      params.set("client_secret", this.config.oAuth.clientSecret);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as InstagramError;
        throw new OAuthError("instagram", error?.error?.message || "Token exchange failed", error);
      }

      const data = (await response.json()) as OAuthTokens & { user_id?: number };

      const expiresIn = data.expiresIn ?? undefined;

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new NetworkError("instagram", "Failed to exchange code for token", error);
    }
  }

  async refreshToken(
    platform: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    try {
      const params = new URLSearchParams();
      params.set("grant_type", "ig_refresh_token");
      params.set("access_token", refreshToken);

      const response = await fetch("https://graph.instagram.com/refresh_access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new InvalidTokenError("instagram", { refreshToken });
      }

      const data = (await response.json()) as OAuthTokens;

      const expiresIn = data.expiresIn ?? undefined;

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? refreshToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof InvalidTokenError) throw error;
      throw new NetworkError("instagram", "Failed to refresh token", error);
    }
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    try {
      await fetch(`https://graph.instagram.com/${token}?access_token=${token}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new NetworkError("instagram", "Failed to revoke token", error);
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
