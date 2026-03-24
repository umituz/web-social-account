/**
 * Twitter OAuth Service Implementation
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

export class TwitterOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("twitter", "Invalid Twitter OAuth configuration");
    }
  }

  async generateAuthorizationUrl(platform: string, userId?: string): Promise<{
    url: string;
    state: string;
  }> {
    try {
      const { codeVerifier, codeChallenge } = await this.generatePKCEChallenge();
      const state = crypto.randomUUID();

      const url = this.config.getAuthorizationUrl(state, codeChallenge);

      // Store state and verifier (implementation depends on storage)
      const stateData = {
        state,
        codeVerifier,
        userId,
        timestamp: Date.now(),
        platform: "twitter" as const,
      };

      return {
        url: url.toString(),
        state,
      };
    } catch (error) {
      throw new OAuthError(
        "twitter",
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

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string };
        throw new OAuthError("twitter", `Token exchange failed: ${error?.error || "Unknown error"}`, error);
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
      throw new NetworkError("twitter", "Failed to exchange code for token", error);
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
      params.set("client_id", this.config.oAuth.clientId);

      const response = await fetch(this.config.oAuth.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new InvalidTokenError("twitter", { refreshToken });
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
      throw new NetworkError("twitter", "Failed to refresh token", error);
    }
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    try {
      await fetch("https://api.twitter.com/2/oauth2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({
          token,
          token_type_hint: "access_token",
        }).toString(),
      });
    } catch (error) {
      throw new NetworkError("twitter", "Failed to revoke token", error);
    }
  }

  async validateState(state: string): Promise<boolean> {
    // Implementation depends on storage
    return true;
  }

  async generatePKCEChallenge(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }> {
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
  }

  private generateRandomString(length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
}
