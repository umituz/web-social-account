
import type { SocialPlatform } from "../../../../domain/types";

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface IOAuthService {
  generateAuthorizationUrl(
    platform: SocialPlatform,
    userId?: string
  ): Promise<{ url: string; state: string }>;

  exchangeCodeForToken(
    platform: SocialPlatform,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse>;

  refreshToken(
    platform: SocialPlatform,
    refreshToken: string
  ): Promise<OAuthTokenResponse>;

  revokeToken(platform: SocialPlatform, token: string): Promise<void>;

  validateState(state: string): Promise<boolean>;

  generatePKCEChallenge(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }>;
}
