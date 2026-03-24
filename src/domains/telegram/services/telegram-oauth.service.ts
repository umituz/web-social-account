/**
 * Telegram OAuth Service Implementation
 *
 * Note: Telegram uses a different auth approach called "Telegram Login Widget"
 * This service is designed for bot-based authentication
 */

import type {
  IOAuthService,
  OAuthTokens,
  PlatformConfig,
} from "../../../domain/types";
import {
  ConfigurationError,
  NetworkError,
} from "../../../domain/errors";
import { PlatformConfigEntity } from "../../core/config/entities/platform-config.entity";

export class TelegramOAuthService implements IOAuthService {
  private config: PlatformConfigEntity;

  constructor(config: PlatformConfig) {
    this.config = config instanceof PlatformConfigEntity ? config : new PlatformConfigEntity(config);

    if (!this.config.validate()) {
      throw new ConfigurationError("telegram", "Invalid Telegram bot configuration");
    }
  }

  async generateAuthorizationUrl(platform: string, userId?: string): Promise<{
    url: string;
    state: string;
  }> {
    // Telegram uses Telegram Login Widget, not traditional OAuth
    // This returns the widget URL
    try {
      const state = crypto.randomUUID();
      const botUsername = this.config.oAuth.clientId; // clientId stores bot username

      const url = new URL("https://telegram.org/js/telegram-widget.js");
      url.searchParams.set("bot", botUsername);
      url.searchParams.set("origin", window.location.origin);
      url.searchParams.set("request_access", "write");

      return {
        url: url.toString(),
        state,
      };
    } catch (error) {
      throw new NetworkError(
        "telegram",
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
    // Telegram doesn't use traditional OAuth token exchange
    // The auth data comes from the widget callback
    // This is a placeholder for compatibility with the interface
    return {
      accessToken: code,
      refreshToken: undefined,
      expiresIn: undefined,
    };
  }

  async refreshToken(
    platform: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    // Telegram doesn't use refresh tokens
    return {
      accessToken: refreshToken,
      refreshToken,
      expiresIn: undefined,
    };
  }

  async revokeToken(platform: string, token: string): Promise<void> {
    // Telegram doesn't have token revocation
    // Tokens are managed by Telegram
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
