/**
 * Platform Config Entity
 *
 * Holds OAuth + API settings for a single platform and builds the
 * authorization URL. Platform-specific defaults live in
 * `platform-config-defaults.ts` (single responsibility: this entity owns
 * URL construction + validation; defaults live elsewhere).
 */

import type { PlatformConfig, SocialPlatform } from "../../../../domain/types";
import { PLATFORM_DEFAULTS, PlatformOAuthDefaults } from "./platform-config-defaults";
import { HTTP_DEFAULTS } from "../../../../shared/limits/http-defaults";
import { hasRequiredOAuthParams } from "../../../../shared/predicates";

export class PlatformConfigEntity implements PlatformConfig {
  oAuth: PlatformConfig["oAuth"];
  apiTimeout: number;
  maxRetries: number;

  constructor(config: PlatformConfig) {
    this.oAuth = config.oAuth;
    this.apiTimeout = config.apiTimeout ?? HTTP_DEFAULTS.TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? HTTP_DEFAULTS.MAX_RETRIES;
  }

  getAuthorizationUrl(state: string, codeVerifier?: string): URL {
    const url = new URL(this.oAuth.authorizationUrl);
    url.searchParams.set("response_type", this.oAuth.responseType ?? "code");
    url.searchParams.set("client_id", this.oAuth.clientId);
    url.searchParams.set("redirect_uri", this.oAuth.redirectUri);
    url.searchParams.set("scope", this.oAuth.scope.join(" "));
    url.searchParams.set("state", state);

    if (this.oAuth.pkce && codeVerifier) {
      url.searchParams.set("code_challenge", codeVerifier);
      url.searchParams.set(
        "code_challenge_method",
        this.oAuth.codeChallengeMethod ?? "S256"
      );
    }

    return url;
  }

  validate(): boolean {
    return hasRequiredOAuthParams(this.oAuth);
  }

  static fromPlatform(
    platform: SocialPlatform,
    config: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope?: string[];
    } & Partial<PlatformConfig["oAuth"]>
  ): PlatformConfigEntity {
    const defaults: PlatformOAuthDefaults | undefined = PLATFORM_DEFAULTS[platform];
    if (!defaults) {
      throw new Error(`No defaults registered for platform: ${platform}`);
    }

    return new PlatformConfigEntity({
      oAuth: {
        ...defaults,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        scope: config.scope ?? defaults.scope,
      },
    });
  }
}
