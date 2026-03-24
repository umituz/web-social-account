/**
 * Discord OAuth Service Implementation
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

export class DiscordOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("discord", "Invalid Discord OAuth configuration");
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
      url.searchParams.set("scope", this.config.oAuth.scope.join(" "));
      url.searchParams.set("state", state);

      return {
        url: url.toString(),
        state,
      };
    } catch (error) {
      throw new OAuthError(
        "discord",
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
      params.set("client_id", this.config.oAuth.clientId);
      params.set("client_secret", this.config.oAuth.clientSecret);
      params.set("grant_type", "authorization_code");
      params.set("code", code);
      params.set("redirect_uri", redirectUri);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as DiscordError;
        throw new OAuthError("discord", error?.message || "Token exchange failed", error);
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
      throw new NetworkError("discord", "Failed to exchange code for token", error);
    }
  }

  async refreshToken(
    platform: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    try {
      const params = new URLSearchParams();
      params.set("client_id", this.config.oAuth.clientId);
      params.set("client_secret", this.config.oAuth.clientSecret);
      params.set("grant_type", "refresh_token");
      params.set("refresh_token", refreshToken);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new InvalidTokenError("discord", { refreshToken });
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
      throw new NetworkError("discord", "Failed to refresh token", error);
    }
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    try {
      await fetch(`${this.config.oAuth.tokenUrl}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.oAuth.clientId,
          client_secret: this.config.oAuth.clientSecret,
          token,
        }).toString(),
      });
    } catch (error) {
      throw new NetworkError("discord", "Failed to revoke token", error);
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
