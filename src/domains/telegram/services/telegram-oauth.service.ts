/**
 * Telegram OAuth Service (Telegram Login Widget)
 *
 * Telegram uses the Telegram Login Widget rather than traditional OAuth.
 * The widget authenticates the user client-side and posts an auth payload
 * back to the app. This service generates the widget URL and acts as a
 * compatibility shim against IOAuthService.
 */

import type { PlatformConfig, SocialPlatform } from "../../../domain/types";
import { BaseOAuthService, AuthorizationUrlParams } from "../../core/oauth/services/base-oauth.service";
import type { ISessionStorage } from "../../core/session/repositories/session-storage.interface";
import { HttpClient } from "../../../infrastructure/http/http-client.util";
import { CryptoUtils } from "../../../infrastructure/utils/crypto.util";
import { NetworkError } from "../../../domain/errors";
import type { OAuthTokenResponse } from "../../core/oauth/services/oauth-service.interface";

export class TelegramOAuthService extends BaseOAuthService {
  constructor(
    config: PlatformConfig,
    http: HttpClient = new HttpClient(),
    storage: ISessionStorage | null = null
  ) {
    super("telegram", config, http, storage);
  }

  protected supportsPKCE(): boolean {
    return false;
  }

  protected supportsRefreshToken(): boolean {
    return false;
  }

  protected supportsRevoke(): boolean {
    return false;
  }

  protected getAuthorizationParams(state: string): AuthorizationUrlParams {
    return {
      client_id: this.config.oAuth.clientId, // bot username stored in clientId
      redirect_uri: "",
      response_type: "code",
      scope: "",
      state,
    };
  }

  protected getAuthorizationEndpoint(): string {
    return "https://telegram.org/js/telegram-widget.js";
  }

  protected getTokenRequestBody(_code: string, _redirectUri: string) {
    // Telegram widget bypasses the standard code-for-token exchange.
    return { grant_type: "telegram_widget" };
  }

  async generateAuthorizationUrl(platform: SocialPlatform, userId?: string) {
    try {
      const state = CryptoUtils.generateState();
      const url = new URL(this.getAuthorizationEndpoint());
      url.searchParams.set("bot", this.config.oAuth.clientId);
      url.searchParams.set("origin", typeof window !== "undefined" ? window.location.origin : "");
      url.searchParams.set("request_access", "write");

      if (this.storage) {
        await this.storage.setOAuthState(state, {
          state,
          timestamp: Date.now(),
          platform,
          userId,
        });
      }

      return { url: url.toString(), state };
    } catch (error) {
      throw new NetworkError(
        this.platform,
        error instanceof Error ? error.message : "Failed to generate Telegram widget URL",
        error
      );
    }
  }

  async exchangeCodeForToken(): Promise<OAuthTokenResponse> {
    return { accessToken: "", expiresIn: undefined };
  }

  async refreshToken(): Promise<OAuthTokenResponse> {
    return { accessToken: "", expiresIn: undefined };
  }

  async revokeToken(): Promise<void> {
    // Telegram does not expose a token-revocation endpoint.
  }
}
